import { ID, OAuthProvider, Query } from "appwrite";
import { account, database } from "./client";
import { redirect } from "react-router";
import { appwriteConfig } from "./client";

export const loginWithGoogle = async () => {
    try {

        account.createOAuth2Session(OAuthProvider.Google)

    } catch (error) {
        console.log(error);
    }
}

export const logoutUser = async () => {
    try {

        await account.deleteSession('current');
        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
}

export const getUser = async () => {
    try {

        const user = await account.get();
        if (!user) return redirect('/sign-in');

        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id),
                Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
            ]
        );

    } catch (error) {
        console.log(error);
    }
}

export const getGooglePicture = async () => {
    try {

        //Get current user session
        const session = await account.getSession('current');

        //Get the OAuth2 token from the session
        const oAuthToken = session.providerAccessToken;

        if (!oAuthToken) {
            console.log('No OAuth2 token found');
            return null;
        }

        //Make a request to Google People API to get the user's profile picture
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
            headers: {
                'Authorization': `Bearer ${oAuthToken}`
            }
        });

        if (!response.ok) {
            console.log('Failed to fetch profile picture from Google');
            return null;
        }

        const data = await response.json();

        const photoUrl = data.photos && data.photos.length > 0 ? data.photos[0].url : null;

        return photoUrl;

    } catch (error) {
        console.log(error);
    }
}
export const storeUserData = async () => {
    try {

        const user = await account.get();
        if (!user) return null;

        //Check if user already exists in db
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id),

            ]
        );

        if (documents.length > 0) {
            //User already exists
            return documents[0];
        }

        // Get profile pic from Google
        const imageUrl = await getGooglePicture();

        //Create new user document
        const newUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                name: user.name,
                email: user.email,
                imageUrl: imageUrl || '',
                joinedAt: new Date().toISOString(),
            }
        );

        return newUser;

    } catch (error) {
        console.log(error);
    }
}

export const getExistingUser = async () => {
    try {

        const user = await account.get();
        if (!user) return null;

        //Check if user already exists in db
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id),
            ]
        );

        if (documents.length > 0) {
            //User already exists
            return documents[0];
        }

        return null;

    } catch (error) {
        console.log(error);
    }
}