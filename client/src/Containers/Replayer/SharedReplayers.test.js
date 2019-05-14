import React from 'react';
import { shallow, mount } from 'enzyme';
import SharedReplayer from './SharedReplayer';

import room from '../../../__mocks__/testRoom';
import user from '../../../__mocks__/testUser';

describe('component - SharedReplayer', () => {
  const mock = jest.fn();
  const encMock = jest.fn();
  const props = {
    room,
    user,
    match: { params: { roomId: room._id } },
    populateRoom: mock,
    encompass: false,
  };

  it('renders the vmt replayer', () => {
    shallow(<SharedReplayer {...props} />);
    expect(mock).toHaveBeenCalled();
  });

  it('builds the log after populating', () => {
    const wrapper = shallow(<SharedReplayer {...props} loading={true} />);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'buildLog');
    jest.spyOn(instance, 'componentDidUpdate');
    wrapper.setProps({ loading: false });
    expect(instance.componentDidUpdate).toHaveBeenCalled();
    expect(instance.buildLog).toHaveBeenCalled();
  });

  it('renders the encompass replayer', () => {
    const mock = jest.fn();
    props.onLoadEnc = encMock;
    const wrapper = shallow(<SharedReplayer {...props} encompass />);
    const instance = wrapper.instance();
    jest.spyOn(instance, 'buildLog');
    instance.componentDidMount();
    expect(mock).not.toHaveBeenCalled();
    expect(encMock).toHaveBeenCalled();
    expect(instance.buildLog).toHaveBeenCalled();
  });

  // it('plays the replayer', () => {

  // })
});
