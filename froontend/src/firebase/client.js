import { getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDR0r5SvnsFHln7jJZJ3-ZCYjZcLGH4z1s',
  authDomain: 'proyecto2fa.firebaseapp.com',
  projectId: 'proyecto2fa',
  storageBucket: 'proyecto2fa.appspot.com',
  messagingSenderId: '631453743727',
  appId: '1:631453743727:web:3c33806fe78edcc273ab9a',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
auth.languageCode = 'es'

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export const firebaseApp = app