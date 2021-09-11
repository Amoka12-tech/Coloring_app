import { combineReducers } from 'redux';
import catalogue from './catalogue';
import images from './imageUrls';
import drawings from './drawings';

export default combineReducers({ catalogue, images, drawings });
