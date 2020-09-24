// import styles from '../styles/layout.module.css';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCurrentUser } from '../lib/hooks';
import { Box, Button, Heading, Grommet, Header, Footer, Text, Nav } from 'grommet';
import { Logout } from 'grommet-icons';
const theme = {
  global: {
    colors: {
      brand: '#228BE6',
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

export default function Layout({ children }) {
  const [user, { mutate }] = useCurrentUser();
  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'DELETE',
    });
    mutate(null);
  };
  return (
    <Grommet theme={theme} full>
      <Box fill>
        <Header background="brand" pad="small">
          <Heading level="3" margin="none">
            <Link href="/">
              <a>Rrudraksh Group</a>
            </Link>
          </Heading>
          <Head>
            <title>Rrudraksh Group</title>
            <meta
              key="viewport"
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
          </Head>
          {!user ? (
            <Nav direction="row" align="center">
              <Link href="/login">
                <a>Sign in</a>
              </Link>
              <Link href="/signup">
                <a>Sign up</a>
              </Link>
            </Nav>
          ) : (
            <Nav direction="row" align="center">
              <Link href="/user/[userId]" as={`/user/${user._id}`}>
                <a>Profile</a>
              </Link>
              <Link href="/daily">
                <a>Daily</a>
              </Link>
              <Link href="/dashboard">
                <a>Dashboard</a>
              </Link>
              <Button icon={<Logout />} onClick={handleLogout} />
            </Nav>
          )}
        </Header>
        <Box direction="row" flex overflow={{ horizontal: 'hidden' }}>
          <Box flex align="start" justify="start" pad={'20px'}>
            {children}
          </Box>
        </Box>
        <Footer background="brand" pad="medium">
          <Text size="small">Copyright</Text>
        </Footer>
      </Box>
    </Grommet>
  );
}
