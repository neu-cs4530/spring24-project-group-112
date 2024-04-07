// import { Container } from '@chakra-ui/react';
// import React, { useEffect, useRef, useState } from 'react';
// import ReactPlayer from 'react-player';
// import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
// import WardrobeAreaController from '../../../../classes/interactable/WardrobeAreaController';
// import useTownController from '../../../../hooks/useTownController';
// import SelectVideoModal from '../SelectVideoModal';
// import WardrobeAreaInteractable from '../ViewingArea';

// const ALLOWED_DRIFT = 3;
// export class MockReactPlayer extends ReactPlayer {
//   render(): React.ReactNode {
//     return <></>;
//   }
// }

// /**
//  * The ViewingAreaVideo component renders a ViewingArea's video, using the ReactPlayer component.
//  * The URL property of the ReactPlayer is set to the ViewingAreaController's video property, and the isPlaying
//  * property is set, by default, to the controller's isPlaying property.
//  *
//  * The ViewingAreaVideo subscribes to the ViewingAreaController's events, and responds to
//  * playbackChange events by pausing (or resuming) the video playback as appropriate. In response to
//  * progressChange events, the ViewingAreaVideo component will seek the video playback to the same timecode.
//  * To avoid jittering, the playback is allowed to drift by up to ALLOWED_DRIFT before seeking: the video should
//  * not be seek'ed to the newTime from a progressChange event unless the difference between the current time of
//  * the video playback exceeds ALLOWED_DRIFT.
//  *
//  * The ViewingAreaVideo also subscribes to onProgress, onPause, onPlay, and onEnded events of the ReactPlayer.
//  * In response to these events, the ViewingAreaVideo updates the ViewingAreaController's properties, and
//  * uses the TownController to emit a viewing area update.
//  *
//  * @param props: A single property 'controller', which is the ViewingAreaController corresponding to the
//  *               current viewing area.
//  */
// export function WardrobeAreaModal({
//   controller,
// }: {
//   controller: WardrobeAreaController;
// }): JSX.Element {
//   const [isPlaying, setPlaying] = useState<boolean>(controller.isPlaying);
//   const townController = useTownController();

//   const reactPlayerRef = useRef<ReactPlayer>(null);

//   useEffect(() => {
//     const progressListener = (newTime: number) => {
//       const currentTime = reactPlayerRef.current?.getCurrentTime();
//       if (currentTime !== undefined && Math.abs(currentTime - newTime) > ALLOWED_DRIFT) {
//         reactPlayerRef.current?.seekTo(newTime, 'seconds');
//       }
//     };
//     controller.addListener('progressChange', progressListener);
//     controller.addListener('playbackChange', setPlaying);
//     return () => {
//       controller.removeListener('playbackChange', setPlaying);
//       controller.removeListener('progressChange', progressListener);
//     };
//   }, [controller]);

//   return (
//     <Container className='participant-wrapper'>
//       Viewing Area: {controller.id}
//       <ReactPlayer
//         url={controller.video}
//         ref={reactPlayerRef}
//         config={{
//           youtube: {
//             playerVars: {
//               // disable skipping time via keyboard to avoid weirdness with chat, etc
//               disablekb: 1,
//               autoplay: 1,
//               // modestbranding: 1,
//             },
//           },
//         }}
//         playing={isPlaying}
//         onProgress={state => {
//           if (state.playedSeconds != 0 && state.playedSeconds != controller.elapsedTimeSec) {
//             controller.elapsedTimeSec = state.playedSeconds;
//             townController.emitViewingAreaUpdate(controller);
//           }
//         }}
//         onPlay={() => {
//           if (!controller.isPlaying) {
//             controller.isPlaying = true;
//             townController.emitViewingAreaUpdate(controller);
//           }
//         }}
//         onPause={() => {
//           if (controller.isPlaying) {
//             controller.isPlaying = false;
//             townController.emitViewingAreaUpdate(controller);
//           }
//         }}
//         onEnded={() => {
//           if (controller.isPlaying) {
//             controller.isPlaying = false;
//             townController.emitViewingAreaUpdate(controller);
//           }
//         }}
//         controls={true}
//         width='100%'
//         height='100%'
//       />
//     </Container>
//   );
// }

// /**
//  * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
//  * a popup to set the video for a viewing area, or if the video is set, a video player.
//  *
//  * @param props: the viewing area interactable that is being interacted with
//  */
// export function WardrobeArea({
//   wardrobeArea,
// }: {
//   wardrobeArea: WardrobeAreaInteractable;
// }): JSX.Element {
//   const townController = useTownController();
//   const wardrobeAreaController = useInteractableAreaController<WardrobeAreaController>(
//     wardrobeArea.name,
//   );
//   const [selectIsOpen, setSelectIsOpen] = useState(wardrobeAreaController.video === undefined);
//   const [viewingWardrobeVideoURL, setWardrobeAreaVideoURL] = useState(wardrobeAreaController.video);
//   useEffect(() => {
//     const setURL = (url: string | undefined) => {
//       if (!url) {
//         townController.interactableEmitter.emit('endIteraction', wardrobeAreaController);
//       } else {
//         setWardrobeAreaVideoURL(url);
//       }
//     };
//     wardrobeAreaController.addListener('videoChange', setURL);
//     return () => {
//         wardrobeAreaController.removeListener('videoChange', setURL);
//     };
//   }, [wardrobeAreaController, townController]);

//     return (
//       <SelectVideoModal
//         isOpen={selectIsOpen}
//         close={() => {
//           setSelectIsOpen(false);
//           // forces game to emit "viewingArea" event again so that
//           // repoening the modal works as expected
//           townController.interactEnd(wardrobeArea);
//         }}
//         viewingArea={wardrobeArea}
//       />
//     );
// }

// /**
//  * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
//  * will activate only if the player begins interacting with a viewing area.
//  */
// export default function WardrobeAreaWrapper(): JSX.Element {
//   const wardrobeArea = useInteractable<WardrobeAreaInteractable>('wardrobeArea');
//   if (wardrobeArea) {
//     return <WardrobeArea wardrobeArea={wardrobeArea} />;
//   }
//   return <></>;
// }
