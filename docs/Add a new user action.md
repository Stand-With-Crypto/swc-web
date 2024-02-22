# Add a new user action

## Create UI

- Create a new folder in src/components/app called userActionForm[insertActionName]
- All UI should be contained in this folder
- Create a dialog.tsx, homepageDialogDeeplinkWrapper.tsx, index.tsx, lazyLoad.tsx, skeleton.tsx

## Update database

- add field to user
- add new model for the action

## Create server action

- Create a new file in src/actions/ with a name like action[insertActionName] to handle the server action logic
- Safe parse all user input utilizing utils such as zod

## Add a new airdrop NFT

- The NFT asset should be added under public/nfts. Ensure that the image size is less than 1MB.
- Update the NFTSlug enum
- Update ACTION_NFT_SLUG in the claimNFT function
- Update the NFT_SLUG_BACKEND_METADATA
- Update the NFT_CLIENT_METADATA
