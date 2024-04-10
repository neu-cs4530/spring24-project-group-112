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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import assert from 'assert';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
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
  const [username, setUsername] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState('');
  const [responseMessage, setResponseMessage] = React.useState('');
  const mailRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const runOnCaughtError = (consoleMsg: string, err: Error) => {
    console.error(consoleMsg + err);
    setAuthing(false);
    setError(err.message);
    setResponseMessage('');
  };

  const signIn = async () => {
    setAuthing(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user === null) {
        throw new Error('User not found');
      }
      const id = userCredential.user?.uid;
      const docRef = doc(db, 'accounts', id);
      console.log('Searching for username...');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().userName !== undefined) {
        const userName = docSnap.data().userName;
        console.log('Log in successful as ' + userName);
        setAuthing(false);
        setError('');
        setResponseMessage('Logged in as: ' + userName);
        props.callback(userName, id);
      } else {
        throw new Error('User document not found');
      }
    } catch (err) {
      assert(err instanceof Error); // otherwise ts gets mad
      runOnCaughtError('Error signing in:', err);
    }
  };

  const closeCreationModal = () => {
    onClose();
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const createAccount = async () => {
    setAuthing(true);

    try {
      if (username === '') {
        throw new Error('Username cannot be empty');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created for ' + userCredential.user?.email);
      const userDocRef = doc(db, 'accounts', userCredential.user?.uid);

      await setDoc(userDocRef, { userName: username });
      setAuthing(false);
      setError('');
      setResponseMessage('Account Created');
      closeCreationModal();
    } catch (err) {
      assert(err instanceof Error); // otherwise ts gets mad
      runOnCaughtError('Error creating account:', err);
    }
  };

  return (
    <Stack>
      <h1>Welcome to Covey.Town!</h1>
      <Box p='4' borderWidth='1px' borderRadius='lg'>
        <FormControl>
          <FormLabel htmlFor='email'>Email</FormLabel>
          <Input
            ref={mailRef}
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
              <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Box p='4' borderRadius='lg'>
          <Stack>
            <Button onClick={signIn} isLoading={authing}>
              Login
            </Button>

            <Button onClick={onOpen}>Create Account</Button>
            <Modal finalFocusRef={mailRef} isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Create Account</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl>
                    <FormLabel htmlFor='email'>Email</FormLabel>
                    <Input
                      ref={mailRef}
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
                        <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                          {show ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor='username'>Username</FormLabel>
                    <Input
                      name='username'
                      placeholder='Your username'
                      value={username}
                      onChange={event => setUsername(event.target.value)}
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    onClick={() => {
                      onClose();
                    }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      createAccount();
                    }}>
                    Confirm
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Stack>
        </Box>
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
    </Stack>
  );
}
