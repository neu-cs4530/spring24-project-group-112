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
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import 'firebaseui/dist/firebaseui.css';
import { firebaseConfig } from './Config';
import { ILoginPageProps } from '../../types/CoveyTownSocket';
import firebase from 'firebase/compat/app';

export default function Login(props: ILoginPageProps): JSX.Element {
  if (props.app === undefined) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = getAuth();
  const db = getFirestore();
  const [authing, setAuthing] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState('');
  const [responseMessage, setResponseMessage] = React.useState('');

  const signIn = async () => {
    setAuthing(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log('Log in successful as ' + userCredential.user?.email);
        setAuthing(false);
        setError('');
        setResponseMessage("Logged in as: " + email);
      })
      .catch(error => {
        console.error('Error signing in:', error);
        setAuthing(false);
        setError(error.message);
        setResponseMessage("");
      });
  };

  const createAccount = async () => {
    setAuthing(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async userCredential => {
        console.log('Account created for ' + userCredential.user?.email);
        await addDoc(collection(db, 'users'), { username: email, userId: userCredential.user.uid });
        setAuthing(false);
        setError('');
        setResponseMessage('Account Created');
      })
      .catch(error => {
        console.error('Error creating account:', error);
        setAuthing(false);
        setError(error.message);
        setResponseMessage("");
      });
  };

  const deleteAccount = async () => {
    setAuthing(true);

    deleteUser(auth.currentUser)
      .then(() => {
        console.log('Account deleted');
        setAuthing(false);
        setError('');
        setResponseMessage('Account Deleted');
      })
      .catch(error => {
        console.error('Error deleting account:', error);
        setAuthing(false);
        setError(error.message);
        setResponseMessage("");
      });
  };

  return (
    <Stack>
      <h1>Welcome to Covey.Town!</h1>
      <Box p='4' borderWidth='1px' borderRadius='lg'>
        <FormControl>
          <FormLabel htmlFor='email'>Email</FormLabel>
          <Input
            autoFocus
            name='email'
            placeholder='Your email'
            value={email}
            onChange={event => setEmail(event.target.value)}
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
        {error && (
          <Box color='red' as='h4' mt={2} fontSize='sm'>
            {error}
          </Box>
        )}
        {responseMessage && (
          <Heading as='h4' mt={2} size='sm'>
            {responseMessage}
          </Heading>
      )}
      </Box>
      <Button onClick={signIn} isLoading={authing}>
        Login
      </Button>
      <Button onClick={createAccount} isLoading={authing}>
        Create Account
      </Button>
      <Button onClick={deleteAccount} isLoading={authing}>
        Delete Account
      </Button>
    </Stack>
  );
}
