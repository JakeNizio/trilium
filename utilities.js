// converts degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// returns distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

// returns age from birthday
function getAgeFromBirthday(birthday) {
  // console.log('ping > getAgeFromBirthday: ', birthday)
  const birthDate = new Date(birthday.split('/')[2], birthday.split('/')[0], birthday.split('/')[1])
  const currentDate = new Date(Date.now())
  
  var years = currentDate.getFullYear() - birthDate.getFullYear()
  const months = currentDate.getMonth() - birthDate.getMonth()
  if (months < 0) {
      years -= 1
  } else if (months === 0) {
      const days = currentDate.getDate() - birthDate.getDate()
      if (days < 0) {
          years -= 1
      }
  }
  return years
}

import Toast from 'react-native-root-toast';
import { globalColors } from './globalDesign'
// generates errorToast on screen using input error message
function errorToast(error) {
  // console.log('utilities.js > errorToast > ', error)
  
  let map = new Map([
    ['Email rate limit exceeded', 'Too many requests, please try again later'], // this isn't unique to a user, this is my SMTP
    ['Email already in use', 'An account with that email already exists'],
    ['New password should be different from the old password.', 'New password should be different from the old password'],
    ['User under 18', 'Users must be 18 years of age or older'],
  ]);

  let message = map.get(error) ?? 'Unknown error occurred'

  Toast.show(message, {
    duration: 4000,
    position: -24,
    backgroundColor: globalColors.error
  })
}

// generates notification Toast on screen using input message
function notificationToast(message) {
  Toast.show(message, {
    duration: 4000,
    position: -24,
    backgroundColor: globalColors.neutral
  })
}

// checks that the password meets safe password criteria
function validatePassword (password) {
  let check = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/; // regex one lowercase, one uppercase, one number, 8 letters min
  if (password.match(check)) {
      return true
  } else {
      return false
  }
}

// email validation
function validateEmail(email) {
  // regex - phrase + @ + phrase + . + phrase
  let check = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(check)) {
      return true
  } else {
      return false
  }
}

module.exports = { getDistanceFromLatLonInKm, getAgeFromBirthday, errorToast, notificationToast, validatePassword, validateEmail }

