// 'use client';
import React from 'react';
import {
  Button,
  Stack,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';
import { firebaseConfig } from './Config';
import { ILoginPageProps } from '../../types/CoveyTownSocket';
import firebase from 'firebase/compat/app';

export default function Login(props: ILoginPageProps): JSX.Element {
  if (props.app === undefined) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = getAuth();
  const [authing, setAuthing] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [show, setShow] = React.useState(false);

  const signIn = async () => {
    setAuthing(true);

    signInWithEmailAndPassword(auth, username, password)
      .then(userCredential => {
        // Signed in
        console.log('Log in successful as ' + userCredential.user?.email);
        setAuthing(false);
      })
      .catch(error => {
        console.error('Error signing in:', error);
        setAuthing(false);
      });
  };

  return (
    <Stack>
      <h1>Welcome to Covey.Town!</h1>
      <Box p='4' borderWidth='1px' borderRadius='lg'>
        <Heading as='h2' size='lg'>
          Please enter your credentials
        </Heading>

        <FormControl>
          <FormLabel htmlFor='username'>Username</FormLabel>
          <Input
            autoFocus
            name='username'
            placeholder='Your username'
            value={username}
            onChange={event => setUsername(event.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='password'>Password</FormLabel>
          <InputGroup>
            <Input
              type={show ? 'text' : 'password'}
              name='password'
              value={password}
              placeholder='Enter password'
              onChange={event => setPassword(event.target.value)}
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={event => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
      </Box>
      <Button onClick={signIn} isLoading={authing}>
        Login
      </Button>
    </Stack>
  );
}
