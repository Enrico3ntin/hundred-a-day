import { getAnalytics, logEvent, type Analytics } from "firebase/analytics";
import { $firebaseApp } from './firebase';
import { atom, onMount } from "nanostores";

const $firebaseAnalytics = atom<Analytics | undefined>();
onMount($firebaseAnalytics, () => {
    $firebaseAnalytics.set(getAnalytics($firebaseApp.get()));
});

export const events = {
    ANONYMOUS_SIGN_IN : 'Anonymous user signs in',
    AUTHENTICATED_SIGN_IN : 'Authenticated user signs in',
    AUTHENTICATED_SIGN_OUT : 'Authenticated user signs out',
    NAVIGATION : 'User navigates to page',
    SESSION_LOG : 'User logs a push-up session',
};

export const logAnalyticsEvent : (event:keyof typeof events)=>void =
(event) => {
    const analytics = $firebaseAnalytics.get();
    if (analytics) logEvent(analytics, events[event]);
}