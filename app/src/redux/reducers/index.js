import { combineReducers } from 'redux';
import catalogue from './catalogue';
import images from './imageUrls';
import drawings from './drawings';
import imageSettings from './imageSettings';

export default combineReducers({ catalogue, images, drawings, imageSettings });
