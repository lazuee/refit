import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ChangelogViewer from './ChangelogViewer';
import LoaderBoundary from '../LoaderBoundary';
import useDependencyLoader from '../useDependencyLoader';
import { getChangelog } from '../../common/changelog';

const Changelog = ({
	name,
	version,
	url,
	full,
	isFocused,
	onExit,
	exitKey,
	exitKeyLabel,
	exitText,
	showExitOnFallback,
}) => {
	const {
		loading,
		updateLoading,
		loaderText,
		updateLoaderText,
		showLoaderError,
	} = useDependencyLoader();
	const [changelog, setChangelog] = useState({ data: [], url: '' });

	const startLoader = useCallback(async () => {
		try {
			updateLoaderText('fetching changelog');
			const res = await getChangelog({
				name,
				version: full ? null : version,
				url,
			});
			setChangelog(res);
		} catch (err) {
			// TODO: test error handling
			showLoaderError();
			throw err;
		} finally {
			updateLoading(false);
		}
	}, [
		updateLoading,
		showLoaderError,
		updateLoaderText,
		name,
		version,
		url,
		full,
	]);

	useEffect(() => {
		startLoader();
	}, [startLoader]);

	return (
		<LoaderBoundary loading={loading} text={loaderText}>
			<ChangelogViewer
				isFocused={isFocused}
				name={name}
				url={changelog?.url}
				data={changelog?.data}
				height={30}
				width={80}
				onExit={onExit}
				exitKey={exitKey}
				exitKeyLabel={exitKeyLabel}
				exitText={exitText}
				showExitOnFallback={showExitOnFallback}
			/>
		</LoaderBoundary>
	);
};

Changelog.propTypes = {
	name: PropTypes.string.isRequired,
	version: PropTypes.string,
	url: PropTypes.string,
	full: PropTypes.bool,
	isFocused: PropTypes.bool,
	onExit: PropTypes.func.isRequired,
	exitKey: PropTypes.func,
	exitKeyLabel: PropTypes.string,
	exitText: PropTypes.string,
	showExitOnFallback: PropTypes.bool,
};

Changelog.defaultProps = {
	url: undefined,
	version: undefined,
	isFocused: true,
	full: false,
	exitKey: undefined,
	exitKeyLabel: undefined,
	exitText: undefined,
	showExitOnFallback: false,
};

export default Changelog;
