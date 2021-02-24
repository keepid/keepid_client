import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelect, useValue } from 'react-cosmos/fixture';

import Table from './Table';

const columns = [{
  dataField: 'col-1',
  text: 'First Column',
}, {
  dataField: 'col-2',
  text: 'Second Column',
}, {
  dataField: 'col-3',
  text: 'Third Column',
}, {
  dataField: 'col-4',
  text: 'Fourth Column',
}, {
  dataField: 'col-5',
  text: 'Fifth Column',
}];
const generateRow = (idx) => ({
  id: `${idx}`, 'col-1': `${idx}A`, 'col-2': `${idx}B`, 'col-3': `${idx}C`, 'col-4': `${idx}D`, 'col-5': `${idx}E`,
});

const data = [generateRow(1), generateRow(2), generateRow(3), generateRow(4)];
const TableFixture = () => {
  const [canModify] = useValue<boolean>('canModify', {
    defaultValue: false,
  });
  const [canSelect] = useValue<boolean>('canSelect', {
    defaultValue: false,
  });
  return (<Table data={data} columns={columns} emptyInfo={{ description: 'empty' }} canModify={canModify} canSelect={canSelect} />);
};

export default TableFixture;
