import React, { PureComponent } from "react";
import Aux from "../../HOC/Auxil";
import RadioBtn from "../../Form/RadioBtn/RadioBtn";
class EditMember extends PureComponent {
  render() {
    const { changeRole, role } = this.props;
    return (
      <Aux>
        <RadioBtn
          check={changeRole}
          checked={role === "facilitator"}
          name={"facilitator"}
        >
          Facilitator
        </RadioBtn>
        <RadioBtn
          check={changeRole}
          checked={role === "participant"}
          name={"participant"}
        >
          Participant
        </RadioBtn>
      </Aux>
    );
  }
}

export default EditMember;
