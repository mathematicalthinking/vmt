import React from 'react';
import { Link } from 'react-router-dom';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
const confirmation = props => (
  <div>
    <ContentBox title="Your request has been sent">
      <Link to='/dashboard/rooms'>Go to your dashboard</Link>
    </ContentBox>
  </div>
);

export default confirmation;
