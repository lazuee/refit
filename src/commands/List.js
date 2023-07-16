import React, { useEffect, useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { Box, Text } from 'ink';
import NameColumn from '../ui/NameColumn';
import UpgradeColumn from '../ui/UpgradeColumn';
import Table, { calculateColumnWidths } from '../ui/Table';
import Static from '../ui/Static';
import useDependencyLoader from '../ui/useDependencyLoader';
import UpToDateBoundary from '../ui/UpToDateBoundary';
import LoaderBoundary from '../ui/LoaderBoundary';
import { mapDataToRows } from '../common/dependencies';
import getDependencies from '../common/getDependencies';

// get table columns based on the config
const getListColumns = ({ verbose, monorepo }) => [
	{
		name: 'Name',
		accessor: 'name',
		Component: NameColumn,
		show: true,
	},
	{
		name: 'Target',
		accessor: 'target',
		show: true,
		noWrap: true,
	},
	{
		name: 'Installed',
		accessor: 'installed',
		show: true,
		noWrap: true,
	},
	{
		name: 'Wanted',
		accessor: 'wanted',
		show: verbose,
		noWrap: true,
	},
	{
		name: 'Latest',
		accessor: 'latest',
		show: verbose,
		noWrap: true,
	},
	{
		name: 'Upgrade',
		accessor: 'upgrade',
		Component: UpgradeColumn,
		show: true,
		noWrap: true,
	},
	{
		name: 'Type',
		accessor: 'type',
		show: verbose,
		wrap: 'truncate',
	},
	{
		name: 'Hoisted',
		accessor: 'hoisted',
		show: verbose && monorepo,
		wrap: 'truncate',
	},
	{
		name: 'In',
		accessor: 'in',
		show: verbose && monorepo,
		wrap: 'truncate',
	},
];

const problemColumns = [
	{
		name: 'Name',
		accessor: 'name',
		Component: NameColumn,
		show: true,
	},
	{
		name: 'Target',
		accessor: 'target',
		show: true,
		noWrap: true,
	},
	{
		name: 'Installed',
		accessor: 'installed',
		show: true,
		noWrap: true,
	},
	{
		name: 'Upgrade',
		accessor: 'upgrade',
		Component: UpgradeColumn,
		show: true,
		noWrap: true,
	},
];

const List = ({ config }) => {
	const [dependencies, setDependencies] = useState([]);
	const [dependencyProblems, setDependencyProblems] = useState(null);
	const {
		loading,
		updateLoading,
		loaderText,
		updateProgress,
		showLoaderError,
	} = useDependencyLoader();

	const startLoader = useCallback(async () => {
		try {
			// get dependencies data
			const dependenciesData = await getDependencies(
				config,
				updateProgress
			);

			// format the data for the tab rows
			const formattedData = mapDataToRows(dependenciesData);

			setDependencies(formattedData);
			setDependencyProblems({
				installNeeded: mapDataToRows(
					dependenciesData.filter((d) => d.installNeeded)
				),
				notOnRegistry: mapDataToRows(
					dependenciesData.filter((d) => d.notOnRegistry)
				),
			});
			updateLoading(false);
		} catch (error) {
			showLoaderError();
			throw error;
		}
	}, [config, updateProgress, updateLoading, showLoaderError]);

	useEffect(() => {
		startLoader();
	}, [startLoader]);

	const columns = useMemo(() => {
		const baseColumns = getListColumns(config);
		return baseColumns.filter((c) => c.show);
	}, [config]);

	const columnWidths = useMemo(
		() => calculateColumnWidths({ data: dependencies, columns }),
		[columns, dependencies]
	);

	const showInstallNeeded = dependencyProblems?.installNeeded?.length > 0;
	const showNotOnRegistry = dependencyProblems?.notOnRegistry?.length > 0;
	const hasProblems = showInstallNeeded || showNotOnRegistry;

	return (
		<LoaderBoundary loading={loading} text={loaderText}>
			<UpToDateBoundary enabled={!dependencies.length}>
				<Static>
					<Table
						data={dependencies}
						columns={columns}
						maxColumnWidths={columnWidths.max}
					/>

					{hasProblems && (
						<Box flexDirection="column" marginTop={1}>
							<Box>
								<Text color="red" bold>
									Issues Detected:
								</Text>
							</Box>
							{showInstallNeeded && (
								<>
									<Text color="red">
										dependencies requiring install
									</Text>
									<Table
										data={dependencyProblems.installNeeded}
										columns={problemColumns}
										borderColor="red"
										maxColumnWidths={columnWidths.max}
									/>
								</>
							)}

							{showNotOnRegistry && (
								<>
									<Text color="red">
										dependencies missing from the registry
									</Text>
									<Table
										data={dependencyProblems.notOnRegistry}
										columns={problemColumns}
										borderColor="red"
										maxColumnWidths={columnWidths.max}
									/>
								</>
							)}

							{showInstallNeeded && (
								<Box>
									<Text>Run </Text>
									<Text color="blue">npm install </Text>
									<Text>to resolve dependency issues</Text>
								</Box>
							)}
						</Box>
					)}
				</Static>
			</UpToDateBoundary>
		</LoaderBoundary>
	);
};

List.propTypes = {
	config: PropTypes.shape({}).isRequired,
};

export default List;
