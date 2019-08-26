import firebase from 'firebase';
import uuid from 'uuid';
import _ from 'lodash';

// Configure Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfbDF8utUFsPVEXlycK8oamMEhoHykRMM",
  authDomain: "bitchat-blockstack.firebaseapp.com",
  databaseURL: "https://bitchat-blockstack.firebaseio.com",
  projectId: "bitchat-blockstack",
  storageBucket: "bitchat-blockstack.appspot.com",
  messagingSenderId: "538354163385",
  appId: "1:538354163385:web:0dc146e9751bb001"
};

const CHAT_COLLECTION_NAME = 'chats';
const FRIEND_COLLECTION_NAME = 'friends';

export default class FirebaseUtils {
  /**
   * Initialize the class
   * @param {object} that
   * @return {void}
   */
  static init (that, enablePersistence = true) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    this._db = firebase.firestore();
    this._messaging = firebase.messaging();
    if (enablePersistence) {
      firebase.firestore().enablePersistence()
        .catch(function(err) {
          console.error('Error enabling firestore persistence:', err);
          if (err.code === 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a a time.
          } 
          else if (err.code === 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
          }
        });
    }
  }

  static async subscribeTokenToTopic (token, topic) {
    try {
      const res = await fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
        method: 'POST',
        headers: new Headers({
          'Authorization': `key=${firebaseConfig.apiKey}`
        })
      })
      
      if (res.status < 200 || res.status >= 400) {
        throw Error(`Error subscribing to topic: ${res.status} - ${res.text()}`);
      }
      console.log(`Successfully subscribed to ${topic}`);
    }
    catch (e) {
      console.error(e);
      throw e;
    }
  }

  static async loadFriends (username) {
    try {
      let res = await this._db.collection(FRIEND_COLLECTION_NAME)
        .doc(username)
        .get();
      res = res.data() || { friends: [] };
      console.log('Friends:', res);
      return res;
    }
    catch (e) {
      console.error('Error loading friends:', e);
      throw e;
    }
  }

  /**
   * Give the user a new friend
   * @param {string} username 
   * @param {string} friendUsername 
   */
  static async addFriend (username, friendUsername) {
    try {
      // Read
      let friends = await this._db.collection(FRIEND_COLLECTION_NAME)
        .doc(username)
        .get();
      friends = friends.data() || { friends: [] };
      // Modify
      friends.friends.push({ username: friendUsername });
      // Write
      await this._db.collection(FRIEND_COLLECTION_NAME)
        .doc(username)
        .set(friends);
      console.log('Friends:', friends);
      return friends;
    }
    catch (e) {
      console.error(`Error adding friend ${friendUsername}:`, e);
      throw e;
    }
  }

  /**
   * Loads all the messages that have been sent between two users
   * @param {string} senderUsername
   * @param {string} receiverUsername
   */
  static async loadMessages (senderUsername, receiverUsername) {
    try {
      let sentMessages = await this._db.collection(CHAT_COLLECTION_NAME)
        .where('senderUsername', '==', senderUsername)
        .where('receiverUsername', '==', receiverUsername)
        .orderBy('timestamp', 'desc')
        .get();
      let receivedMessages = await this._db.collection(CHAT_COLLECTION_NAME)
        .where('senderUsername', '==', receiverUsername)
        .where('receiverUsername', '==', senderUsername)
        .orderBy('timestamp', 'desc')
        .get();
      
      sentMessages = sentMessages.docs.map(p => ({ ...p.data(), id: p.id }));
      receivedMessages = receivedMessages.docs.map(p => ({ ...p.data(), id: p.id }));
      
      const messages = sentMessages.concat(receivedMessages);
      messages.sort((l, r) => l.timestamp - r.timestamp);
      
      console.log('Messages:', messages);
      
      return messages;
    }
    catch (e) {
      console.error(`Error loading messages from ${senderUsername} to ${receiverUsername}:`, e);
      throw e;
    }
  }

  /**
   * Sends a message from one user to another
   * @param {object} messageBody
   * @param {string} senderUsername
   * @param {string} receiverUsername
   */
  static async sendMessage (messageBody, senderUsername, receiverUsername) {
    try {
      let message = {
        senderUsername, receiverUsername, 
        timestamp: Date.now(), body: messageBody, type: 'text'
      };
      await this._db.collection(CHAT_COLLECTION_NAME)
        .add(message);
      console.log(`Sent message from ${senderUsername} to ${receiverUsername}`, message);
    }
    catch (e) {
      console.error(`Error sending message from ${senderUsername} to ${receiverUsername}`, e);
      throw e;
    }
  }

  static checkMessagesPeriodically (that, onReceive) {
    
  }
}