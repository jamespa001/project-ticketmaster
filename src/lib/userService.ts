import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export async function createUserProfileDocument(
  user: User,
  additionalData = {},
) {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;

    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: email || '',
        displayName: displayName || email?.split('@')[0] || 'User',
        photoURL: photoURL || '',
        stripeCustomerId: null, // Will populate when Stripe checkout is initialized
        createdAt: serverTimestamp(),
        ...additionalData,
      });
    } catch (error) {
      console.error('Error creating user profile in Firestore', error);
    }
  }

  return userRef;
}
