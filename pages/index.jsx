import React from 'react';
import { useCurrentUser } from '../lib/hooks';

const IndexPage = () => {
  const [user] = useCurrentUser();

  return (
    <>
      {user && <p>Please use top menu to continue</p>}
      {!user && <p>Please Login to continue</p>}
    </>
  );
};

export default IndexPage;
