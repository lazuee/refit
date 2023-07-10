import pMap from 'p-map';
import pacote from 'pacote';
import semver from 'semver';
import Arborist from '@npmcli/arborist';

const depTypesList = {
	dev: 'devDependencies',
	prod: 'dependencies',
	peer: 'peerDependencies',
	optional: 'optionalDependencies',
};

const semverUpdateColors = {
	major: 'red',
	minor: 'yellow',
	patch: 'green',
};

const getDiffVersionParts = (current, upgrade, returnCurrent = false) => {
	if (!current || !upgrade) {
		return {};
	}

	// check for a wildcard
	const upgradeHasWildcard = /^[~^]/.test(upgrade);
	const hasSameWildcard = upgradeHasWildcard && upgrade[0] === current[0];

	// define wildcard and versions to compare
	const wildcard = hasSameWildcard ? upgrade[0] : '';
	const upgradeVersion = hasSameWildcard ? upgrade.slice(1) : upgrade;
	const currentVersion = hasSameWildcard ? current.slice(1) : current;

	// split versions into parts
	const upgradeParts = upgradeVersion.split('.');
	const currentParts = currentVersion.split('.');

	// check where upgrade and current versions differ (major, minor, patch)
	let diffIndex = upgradeParts.findIndex((v, i) => v !== currentParts[i]);
	diffIndex = diffIndex >= 0 ? diffIndex : upgradeParts.length;
	const isMajorChange = diffIndex === 0;
	const isMinorChange = diffIndex === 1;
	const isPatchChange = diffIndex === 2;
	const isPreRelease = upgradeParts[0] === '0';

	// set update type for change
	let updateType;
	if (isMajorChange || isPreRelease) {
		updateType = 'major';
	}

	if (isMinorChange && !isPreRelease) {
		updateType = 'minor';
	}

	if (isPatchChange && !isPreRelease) {
		updateType = 'patch';
	}

	const returnParts = returnCurrent ? currentParts : upgradeParts;

	// create strings for the colored and uncolored parts of the version
	const midDot = diffIndex > 0 && diffIndex < returnParts.length ? '.' : '';
	const uncoloredText = returnParts.slice(0, diffIndex).join('.');
	const coloredText = returnParts.slice(diffIndex).join('.');

	return {
		color: semverUpdateColors[updateType],
		updateType,
		wildcard,
		midDot,
		uncoloredText,
		coloredText,
	};
};

const getDependencyInfo = async ({
	targetRange,
	installedVersion,
	apps,
	name,
	type,
	hoisted,
	internal,
}) => {
	try {
		if (internal) {
			return {
				name,
				type,
				apps,
				hoisted,
				version: {
					installed: '',
					wanted: '',
					latest: '',
				},
				versionRange: {
					target: targetRange,
					wanted: targetRange,
					latest: targetRange,
				},
				internal,
				missing: false,
				installNeeded: false,
				upgradable: false,
				upgradableToWanted: false,
				upgradableToLatest: false,
				color: '',
				updateType: '',
				upgradeParts: {
					wildcard: '',
					midDot: '',
					uncoloredText: '',
					coloredText: '',
				},
				versions: [],
				distTags: {},
			};
		}

		// TODO: support more semver types
		const wildcards = ['^', '~'];
		const currentWildcard =
			wildcards.find((wildcard) => targetRange.includes(wildcard)) || '';

		const registryData = await pacote.packument(name, {}); // TODO: add optional options?

		const versions = Object.keys(registryData.versions);
		const distTags = registryData['dist-tags'];

		// versions
		const wantedVersion = semver.maxSatisfying(versions, targetRange);
		const latestVersion = distTags.latest;

		// ranges
		const wantedRange = currentWildcard + wantedVersion;
		const latestRange = currentWildcard + latestVersion;

		// upgrades
		const upgradableToWanted = targetRange !== wantedRange;
		const upgradableToLatest = targetRange !== latestRange;
		const upgradable = upgradableToWanted || upgradableToLatest;

		// issues
		const missing = !installedVersion;
		const installedIsOff = !semver.satisfies(installedVersion, targetRange);
		const installNeeded = missing || installedIsOff;

		// get coloring and version parts for the upgrade text
		const {
			color,
			updateType,
			wildcard,
			midDot,
			uncoloredText,
			coloredText,
		} = getDiffVersionParts(targetRange, latestRange);

		// get the package link
		// TODO: npms has a bulk API, maybe run a bunch of these using the bulk API instead
		// TODO: will have to change this for yarn support
		// const npmsInfo = await (
		// 	await fetch(`https://api.npms.io/v2/package/${name}`)
		// ).json();
		// const npmLink = npmsInfo?.collected?.metadata?.links?.npm;

		// TODO: make a mapping function for this obj instead of copy/pasting it?
		return {
			name,
			type,
			apps,
			hoisted,
			version: {
				installed: installedVersion,
				wanted: wantedVersion,
				latest: latestVersion,
			},
			versionRange: {
				target: targetRange,
				wanted: wantedRange,
				latest: latestRange,
			},
			internal,
			missing,
			installNeeded,
			upgradable,
			upgradableToWanted,
			upgradableToLatest,
			color,
			updateType,
			upgradeParts: {
				wildcard,
				midDot,
				uncoloredText,
				coloredText,
			},
			versions,
			distTags,
		};
	} catch (error) {
		return {
			name,
			type,
			apps,
			hoisted,
			version: {
				installed: '',
				current: '',
				wanted: '',
				latest: '',
			},
			versionRange: {
				target: '',
				wanted: '',
				latest: '',
			},
			internal,
			missing: true,
			installNeeded: true,
			upgradable: true,
			upgradableToWanted: true,
			upgradableToLatest: true,
			color: '',
			updateType: '',
			upgradeParts: {
				wildcard: '',
				midDot: '',
				uncoloredText: '',
				coloredText: '',
			},
			versions: [],
			distTags: {},
		};
	}
};

const getInstalledDeps = async (pkgPath) => {
	const arb = new Arborist({ path: pkgPath });
	const { children: installedDeps } = await arb.loadActual();

	return installedDeps;
};

const processDependency = (updateFunc, total) => {
	return async (dependencyData, index) => {
		const progressCurrent = index + 1;
		const progressMax = total;

		updateFunc(progressCurrent, progressMax, dependencyData.name);

		return getDependencyInfo(dependencyData);
	};
};

const getDependencyList = async ({
	packageList,
	filterByPackages,
	isHoisted,
	rootPath,
	filterByDeps = [],
	filterByDepTypes = [],
	updateProgress,
	pMapOptions,
	sortAlphabetical = false,
	ignoreInternalDeps = true,
}) => {
	const hoistedDeps = isHoisted
		? await getInstalledDeps(rootPath)
		: new Map();

	let filteredPackages = packageList.values();
	if (filterByPackages.length) {
		filteredPackages = filterByPackages.reduce((acc, pkgName) => {
			if (packageList.has(pkgName)) {
				return [...acc, packageList.get(pkgName)];
			}

			return acc;
		}, []);
	}

	let dependencyList = [];
	for (const {
		name: pkgName,
		path: pkgPath,
		isMonorepoRoot,
		dependencies,
	} of filteredPackages) {
		const isHoistedRoot = isHoisted && isMonorepoRoot;
		const installedDeps = isHoistedRoot
			? hoistedDeps
			: await getInstalledDeps(pkgPath);

		for (const { name, target, type } of dependencies.values()) {
			const isValidName =
				!filterByDeps.length || filterByDeps.includes(name);
			const isValidType =
				!filterByDepTypes.length || filterByDepTypes.includes(type);
			const internal = packageList.has(name);

			const isValidDep =
				(ignoreInternalDeps && !internal) || !ignoreInternalDeps;

			if (isValidName && isValidType && isValidDep) {
				let hoisted = false;
				const installedDep = installedDeps?.get(name);
				const hoistedDep = hoistedDeps?.get(name);
				const installedVersion = (installedDep || hoistedDep)?.version;

				if (!internal && !installedDep && hoistedDep) {
					hoisted = true;
				}

				const existingDepIndex = dependencyList.findIndex((dep) => {
					return (
						dep?.name === name &&
						dep?.targetRange === target &&
						dep?.installedVersion === installedVersion
					);
				});

				if (existingDepIndex > -1) {
					dependencyList[existingDepIndex].apps.push(pkgName);
				} else {
					dependencyList.push({
						name,
						apps: [pkgName],
						type,
						targetRange: target,
						installedVersion,
						hoisted,
						internal,
					});
				}
			}
		}
	}

	const func = processDependency(updateProgress, dependencyList.length);

	dependencyList = await pMap(dependencyList, func, pMapOptions);

	// sort alphabetically by name
	if (sortAlphabetical) {
		dependencyList.sort((a, b) => a.name.localeCompare(b.name));
	} else {
		// sort by semver update type
		dependencyList.sort((a, b) => {
			if (
				b.updateType === a.updateType ||
				(!b.updateType && !a.updateType)
			) {
				return a.name.localeCompare(b.name);
			}

			if (b.updateType === 'major' && a.updateType !== 'major') {
				return 1;
			}

			if (
				b.updateType === 'minor' &&
				a.updateType !== 'major' &&
				a.updateType !== 'minor'
			) {
				return 1;
			}

			if (
				b.updateType === 'patch' &&
				a.updateType !== 'major' &&
				a.updateType !== 'minor' &&
				a.updateType !== 'patch'
			) {
				return 1;
			}

			return -1;
		});
	}

	return dependencyList;
};

const getDependenciesFromPackageJson = ({ pkgJsonData }) => {
	const dependenciesMap = new Map();

	for (const [depTypeShort, depTypeLong] of Object.entries(depTypesList)) {
		const depsOfType = pkgJsonData[depTypeLong];

		if (depsOfType) {
			for (const [depName, depSpec] of Object.entries(depsOfType)) {
				dependenciesMap.set(depName, {
					name: depName,
					target: depSpec,
					type: depTypeShort,
				});
			}
		}
	}

	return dependenciesMap;
};

export {
	getDiffVersionParts,
	getDependencyInfo,
	getDependencyList,
	getDependenciesFromPackageJson,
	getInstalledDeps,
	depTypesList,
};
