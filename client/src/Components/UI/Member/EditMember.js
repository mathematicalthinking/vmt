import React, { PureComponent } from 'react';
import Aux from '../../HOC/Auxil';
import RadioBtn from '../../Form/RadioBtn/RadioBtn';
class EditMember extends PureComponent {

  render() {
    const { changeRole, role } = this.props;
    return (
      <Aux>
        <RadioBtn check={changeRole} checked={role === 'teacher'} name={'teacher'}>Teacher</RadioBtn>
        <RadioBtn check={changeRole} checked={role === 'student'} name={'student'}>Student</RadioBtn>
      </Aux>
    )
  }
}

export default EditMember;
