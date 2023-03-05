import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Text, Box, useInput } from 'ink';
import inkInput from 'ink-text-input';

const { default: TextInput } = inkInput;

const getItemName = (item, key) =>
	typeof item === 'string' ? item : item[key];

const useListView = ({ items, limit }) => {
	const [highlightedIndex, setHighlightedIndex] = useState(0);

	useInput((input, key) => {
		// move up the list
		if (key.upArrow) {
			setHighlightedIndex((prev) => {
				if (prev === 0) {
					return items.length - 1;
				}
				return prev - 1;
			});
		}

		// move down the list
		if (key.downArrow) {
			setHighlightedIndex((prev) => {
				if (prev === items.length - 1) {
					return 0;
				}
				return prev + 1;
			});
		}
	});

	useEffect(() => {
		// reset the highlighted index when the items change
		setHighlightedIndex(0);
	}, [items]);

	const visible = useMemo(() => {
		if (!limit) {
			return {
				items,
				indexes: Array(items).keys(),
			};
		}

		const viewLimit = Math.min(limit, items.length);
		let viewStart = Math.max(
			0,
			highlightedIndex - Math.floor(viewLimit / 2)
		);
		const viewEnd = Math.min(items.length - 1, viewStart + viewLimit - 1);
		viewStart = Math.min(viewStart, viewEnd - viewLimit + 1);

		const visibleItems = items.slice(viewStart, viewEnd + 1);
		const visibleItemsIndexes = Array.from(
			{ length: viewLimit },
			(v, i) => viewStart + i
		);

		return {
			items: visibleItems,
			indexes: visibleItemsIndexes,
		};
	}, [highlightedIndex, limit, items]);

	const getIndex = useCallback(
		(index) => (visible.indexes.length ? visible.indexes[index] : index),
		[visible.indexes]
	);

	return {
		highlightedIndex,
		visibleItems: visible.items,
		getIndex,
	};
};

const useSearch = ({ items, searchable, creatable, labelKey, searchByKey }) => {
	const [searchText, setSearchText] = useState('');

	const searchResults = useMemo(() => {
		let baseItems = items;

		// filter out items that don't match the search text
		if (searchable && searchText) {
			baseItems = items.filter((i) =>
				i[searchByKey].includes(searchText)
			);

			// add the search text as a create option if it doesn't exist in the list
			if (creatable) {
				const isInList = baseItems.some(
					(item) => getItemName(item, labelKey) === searchText
				);
				if (!isInList) {
					baseItems.unshift({
						[labelKey]: searchText,
						create: true,
					});
				}
			}
		}

		return baseItems;
	}, [items, labelKey, searchText, searchByKey, creatable, searchable]);

	const searchComponent = useMemo(() => {
		return searchable ? (
			<Box marginBottom={1}>
				<Text>search: </Text>
				<TextInput value={searchText} onChange={setSearchText} />
			</Box>
		) : null;
	}, [searchable, searchText]);

	return {
		searchResults,
		searchComponent,
	};
};

const List = ({
	title,
	renderTitle,
	searchComponent,
	items,
	getIndex,
	highlightedIndex,
	labelKey,
	selectedIndexes,
	renderItem,
	selectable,
	creatable,
}) => {
	const isSelected = (index) => selectable && selectedIndexes.includes(index);

	const titleComponent = useMemo(() => {
		if (renderTitle) {
			return renderTitle();
		}

		if (title) {
			return (
				<Box marginBottom={1}>
					<Text>{title}</Text>
				</Box>
			);
		}

		return null;
	}, [title, renderTitle]);

	return (
		<Box flexDirection="column">
			{titleComponent}
			{searchComponent}
			<Box flexDirection="column">
				{items.map((item, index) => {
					/*
						const { actualIndex, itemName, highlighted, selected } = getItemInfo(item, index);
					*/
					const actualIndex = getIndex(index);
					const highlighted = actualIndex === highlightedIndex;
					const itemName = getItemName(item, labelKey);
					const textColor = highlighted ? 'blue' : undefined;

					const selected = isSelected(actualIndex);

					let itemComp = <Text color={textColor}>{itemName}</Text>;

					if (item.create && creatable) {
						itemComp = (
							<Box>
								<Box marginRight={1}>
									<Text color="green">[+]</Text>
								</Box>
								<Text color="green">{itemName}</Text>
							</Box>
						);
					} else if (renderItem) {
						itemComp = renderItem(item, highlighted, textColor);
					}

					return (
						<Box key={itemName}>
							<Box marginRight={1}>
								<Text color="blue">
									{highlighted ? '❯' : ' '}
								</Text>
							</Box>
							{selectable && (
								<Box marginRight={1}>
									<Text>{selected ? '◉' : '◯'}</Text>
								</Box>
							)}
							{itemComp}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

List.propTypes = {
	items: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
	).isRequired,
	labelKey: PropTypes.string,
	title: PropTypes.string,
	renderTitle: PropTypes.func,
	renderItem: PropTypes.func,
	searchComponent: PropTypes.node,
	getIndex: PropTypes.func.isRequired,
	highlightedIndex: PropTypes.number.isRequired,
	selectedIndexes: PropTypes.arrayOf(PropTypes.number),
	selectable: PropTypes.bool,
	creatable: PropTypes.bool,
};

List.defaultProps = {
	labelKey: 'label',
	title: '',
	renderTitle: null,
	renderItem: null,
	searchComponent: null,
	selectedIndexes: [],
	selectable: false,
	creatable: false,
};

const CheckSelector = ({
	items,
	onSelect,
	limit,
	labelKey,
	title,
	renderTitle,
	// searchable,
	// searchByKey,
	renderItem,
}) => {
	// const { searchResults, searchComponent } = useSearch({
	// 	items,
	// 	searchable,
	// 	creatable: false,
	// 	labelKey,
	// 	searchByKey,
	// });
	const { highlightedIndex, visibleItems, getIndex } = useListView({
		items,
		limit,
	});
	const [selectedIndexes, setSelectedIndexes] = useState([]);

	useInput((input, key) => {
		// select an item in the list
		if (key.return) {
			onSelect(selectedIndexes.map((i) => items[i]));
			return;
		}

		// select or deselect an item
		if (input === ' ') {
			setSelectedIndexes((prev) => {
				if (prev.includes(highlightedIndex)) {
					return prev.filter((i) => i !== highlightedIndex);
				}
				return [...prev, highlightedIndex];
			});
		}

		// select all items
		if (input === 'a') {
			setSelectedIndexes((prev) => {
				if (prev.length === items.length) {
					return [];
				}
				return items.map((_, index) => index);
			});
		}
	});

	return (
		<List
			title={title}
			renderTitle={renderTitle}
			// searchComponent={searchComponent}
			items={visibleItems}
			getIndex={getIndex}
			highlightedIndex={highlightedIndex}
			labelKey={labelKey}
			selectedIndexes={selectedIndexes}
			renderItem={renderItem}
			selectable
			creatable={false}
		/>
	);
};

CheckSelector.propTypes = {
	items: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
	).isRequired,
	onSelect: PropTypes.func.isRequired,
	limit: PropTypes.number,
	labelKey: PropTypes.string,
	title: PropTypes.string,
	renderTitle: PropTypes.func,
	// searchable: PropTypes.bool,
	// searchByKey: PropTypes.string,
	renderItem: PropTypes.func,
};

CheckSelector.defaultProps = {
	limit: 0,
	labelKey: 'label',
	title: '',
	renderTitle: null,
	// searchable: false,
	// searchByKey: 'label',
	renderItem: null,
};

const Selector = ({
	items,
	onSelect,
	limit,
	labelKey,
	title,
	renderTitle,
	searchable,
	searchByKey,
	creatable,
	renderItem,
}) => {
	const { searchResults, searchComponent } = useSearch({
		items,
		searchable,
		creatable,
		labelKey,
		searchByKey,
	});
	const { highlightedIndex, visibleItems, getIndex } = useListView({
		items: searchResults,
		limit,
	});

	useInput((input, key) => {
		// select an item in the list
		if (key.return) {
			onSelect(searchResults[highlightedIndex]);
		}
	});

	return (
		<List
			title={title}
			renderTitle={renderTitle}
			searchComponent={searchComponent}
			items={visibleItems}
			getIndex={getIndex}
			highlightedIndex={highlightedIndex}
			labelKey={labelKey}
			renderItem={renderItem}
			selectable={false}
			creatable
		/>
	);
};

Selector.propTypes = {
	items: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
	).isRequired,
	onSelect: PropTypes.func.isRequired,
	limit: PropTypes.number,
	labelKey: PropTypes.string,
	title: PropTypes.string,
	renderTitle: PropTypes.func,
	searchable: PropTypes.bool,
	searchByKey: PropTypes.string,
	creatable: PropTypes.bool,
	renderItem: PropTypes.func,
};

Selector.defaultProps = {
	limit: 0,
	labelKey: 'label',
	title: '',
	renderTitle: null,
	searchable: false,
	searchByKey: 'label',
	creatable: false,
	renderItem: null,
};

export { Selector, CheckSelector };
