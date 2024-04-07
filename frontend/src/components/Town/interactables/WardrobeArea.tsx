import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { GenericGameAreaController } from '../../../classes/interactable/GameAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { GameResult, InteractableID, InteractableType, WardrobeStatus } from '../../../types/CoveyTownSocket';
import ChatChannel from './ChatChannel';
import ConnectFourArea from './ConnectFour/ConnectFourArea';
import GameAreaInteractable from './GameArea';
import WardrobeAreaInteractable from './WardrobeArea';
import WardrobeAreaController from '../../../classes/interactable/TownWardrobe/WardrobeAreaController';
import WardrobeBoard from './Wardrobe/WardrobeBoard';


export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

/**
 * A generic component that renders a wardrobe area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * 
 * TODO: What should it render?
 */
function WardrobeArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const wardrobeAreaController = useInteractableAreaController<WardrobeAreaController>(interactableID);
  const townController = useTownController();

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
          wardrobeAreaController.joinGame().catch(err => {
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
 * A wrapper component for the ConnectFourArea and TicTacToeArea components.
 * Determines if the player is currently in a game area on the map, and if so,
 * renders the selected game area component in a modal.
 *
 */
export default function WardrobeWrapper(): JSX.Element {
  const wardrobe = useInteractable<WardrobeAreaInteractable>('wardrobeArea');
  // const townController = useTownController();
  // const closeModal = useCallback(() => {
  //   if (wardrobe) {
  //     townController.interactEnd(wardrobe);
  //     const controller = townController.getWardrobeAreaController(wardrobe);
  //     controller.leaveGame();
  //   }
  // }, [townController, wardrobe]);
  // if (wardrobe) {
  //   return (
  //     <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
  //       <ModalOverlay />
  //       <ModalContent>
  //         <ModalHeader>{wardrobe.name}</ModalHeader>
  //         <ModalCloseButton />
  //         <ModalBody>
  //           <WardrobeArea interactableID={wardrobe.id} />
  //         </ModalBody>
  //       </ModalContent>
  //     </Modal>
  //   );
  // }
  return <></>;
}
