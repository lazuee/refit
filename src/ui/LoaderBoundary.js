import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';

const LoaderBoundary = ({ loading, text, children, debounceMs }) => {
	const [showLoader, setShowLoader] = useState(!debounceMs);
	const timeoutRef = useRef();
	useEffect(() => {
		if (debounceMs) {
			timeoutRef.current = setTimeout(() => {
				setShowLoader(true);
			}, debounceMs);
		}

		return () => {
			clearTimeout(timeoutRef.current);
		};
	}, [debounceMs]);

	if (loading && !showLoader) {
		return null;
	}

	return loading ? <Loader text={text} /> : children;
};

LoaderBoundary.propTypes = {
	loading: PropTypes.bool.isRequired,
	children: PropTypes.node.isRequired,
	text: PropTypes.string,
	debounceMs: PropTypes.number,
};

LoaderBoundary.defaultProps = {
	text: '',
	debounceMs: 0,
};

export default LoaderBoundary;
