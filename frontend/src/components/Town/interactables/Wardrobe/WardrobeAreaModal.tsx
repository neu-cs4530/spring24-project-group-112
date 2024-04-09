import { 
    IconButton,
    Button,
    Container,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    chakra,
    useToast,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import WardrobeAreaController from '../../../../classes/interactable/WardrobeAreaController';
import useTownController from '../../../../hooks/useTownController';
import WardrobeAreaInteractable from '../ViewingArea';
import LinkIcon from '@material-ui/icons/Link';
import PlayerController from '../../../../classes/PlayerController';
import { WardrobeStatus } from '../../../../types/CoveyTownSocket';

const ALLOWED_DRIFT = 3;
export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

export function WardrobeAreaModal({
  controller,
}: {
  controller: WardrobeAreaController;
}): JSX.Element {
  
  const townController = useTownController();

  return <></>
}

export type WardrobeProps = {
    wardrobeAreaController: WardrobeAreaController;
};
const StyledWardrobeBoard = chakra(Container, {
    baseStyle: {
        display: 'flex',
        width: '350px',
        height: '350px',
        padding: '5px',
        flexWrap: 'wrap',
    },
});
const StyledWardrobeSquare = chakra(IconButton, {
    baseStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        flexBasis: '14%',
        border: '1px solid black',
        height: '14%',
        fontSize: '50px',
        _disabled: {
            opacity: '100%',
        },
    },
});


/**
 * Render a wardrobe board: a table with two rows
 * First row is a list of hair options
 * Second row is a list of clothing options
 * Each cell is a button with a picture of the option on it, and clicking the button applies the change to the player
 * "Confirm Changes" button at the bottom of the board to apply all sprite changes
 * Exiting the wardrobe board without applying changes will revert the player's sprite to the state before entering the wardrobe
 * Load the options from the Wardrobe Object (or hardcode if needed)
 * 
 * @param param0 
 * 
 * @returns 
 */

function WardrobeBoard({
    wardrobeAreaController,
}: WardrobeProps): JSX.Element {
    //Link Icons here are placeholders until the images can be properly imported
    return (
        <StyledWardrobeBoard aria-label='Wardrobe Selection Board'>
            <StyledWardrobeSquare aria-label='Hair Option 1' icon={LinkIcon} />
            <StyledWardrobeSquare aria-label='Hair Option 2' icon={LinkIcon} />
            <StyledWardrobeSquare aria-label='Clothing Option 1' icon={LinkIcon} />
            <StyledWardrobeSquare aria-label='Clothing Option 2' icon={LinkIcon} />
            <Button aria-label='Confirm Changes'>Confirm Changes</Button>
        </StyledWardrobeBoard>
    );
}

/**
 * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
 * a popup to set the video for a viewing area, or if the video is set, a video player.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function WardrobeArea({
  wardrobeArea,
}: {
  wardrobeArea: WardrobeAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const wardrobeAreaController = useInteractableAreaController<WardrobeAreaController>(
    wardrobeArea.name,
  );
  
  const [player, setPlayer] = useState<PlayerController | undefined>(wardrobeAreaController.player);
  const [joiningWardrobe, setJoiningWardrobe] = useState(false);
  const [wardrobeStatus, setWardrobeStatus] = useState<WardrobeStatus>(wardrobeAreaController.status);
  const toast = useToast();

  useEffect(() => {
    const updateWardrobeState = () => {
      setPlayer(wardrobeAreaController.player);
      setWardrobeStatus(wardrobeAreaController.status);
    };
    wardrobeAreaController.addListener('playersChange', updateWardrobeState);
  }, [townController, wardrobeAreaController, toast]);

  let statusText = <></>
  if (wardrobeStatus === 'OCCUPIED') {
    const joinButton = (
      <Button
        onClick={() => {
          setJoiningWardrobe(true);
          wardrobeAreaController.joinWardrobe().catch(err => {
            toast({
              title: 'Failed to join wardrobe',
              description: err,
              status: 'error',
            });
          }).finally(() => {
            setJoiningWardrobe(false);
          });
        }}
        isLoading={joiningWardrobe}
        disabled={joiningWardrobe}>
        Join
      </Button>
    );
    statusText = (
      <b>Waiting for player to join. {joinButton}</b>
    );
  } else {
    statusText = <b>Player in Wardrobe: {player?.userName || "(No player yet!)"}</b>
  }

  return (
      <>
      {statusText}
      <WardrobeBoard wardrobeAreaController={wardrobeAreaController} />
      </>
  )
}

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function WardrobeAreaWrapper(): JSX.Element {
  const wardrobeArea = useInteractable<WardrobeAreaInteractable>('wardrobeArea');
  if (wardrobeArea) {
    //return <WardrobeArea wardrobeArea={wardrobeArea} />;
    return (
        <Modal isOpen={true} closeOnOverlayClick={false} size='xl' onClose={function (): void {
            throw new Error('Function not implemented.');
        } }>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Wardrobe!</ModalHeader>
          <ModalCloseButton />
        </ModalContent>
      </Modal>
    )
  }
  return <></>;
}
