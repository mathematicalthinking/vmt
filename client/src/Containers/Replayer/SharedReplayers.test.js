import React from 'react';
import { shallow } from 'enzyme';
import SharedReplayer from './SharedReplayer';

describe('component - replayer', () => {
  it('renders the replayer', () => {
    const comp = shallow(<SharedReplayer />);

    comp.find('button');
  });
});
