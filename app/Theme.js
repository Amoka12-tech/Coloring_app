import { extendTheme } from 'native-base';
import Svg, { Rect } from 'react-native-svg';
import React from 'react';
import { Image } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const colors = {
  main: '#f273cb',
  background: '#fff',
  grey: '#bababa',
  lightGrey: '#eaeaea',
  darkGrey: '#626262',
  purple: '#cb8bfa',
  purple_darker: '#aa56e8',
  blue: '#8FA8FD',
  green: '#9EEBA4',
};

export const brushes = [
  {
    name: 'Pastel',
    svg: (
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={139.419}
        height={18.997}
        viewBox="0 0 139.419 18.997"
      >
        <Rect
          data-name="Rectangle 12"
          width={139.419}
          height={18.997}
          rx={9.499}
          fill="#daafff"
        />
      </Svg>
    ),
  },
  {
    name: 'Pencil',
    svg: (
      <Image style={{ marginEnd: -10 }} source={require('./res/pencil.png')}/>
    ),
  },
  {
    name: 'Marker',
    svg: (
      <Image style={{ marginEnd: -20 }} source={require('./res/marker.png')}/>
    ),
  },
  {
    name: 'Airbrush',
    svg: <Image style={{ marginEnd: -20 }} source={require('./res/air.png')}/>,
  },
  {
    name: 'Paintbrush',
    svg: (
      <Image style={{ marginEnd: -20 }} source={require('./res/paint.png')}/>
    ),
  },
  {
    name: 'Watercolor',
    svg: (
      <Image style={{ marginEnd: -10 }} source={require('./res/water.png')}/>
    ),
  },
];

export const imgSize = { width: (hp(60) * 1978) / 2560, height: hp(60) };

export default extendTheme({
  fontConfig: {
    Quicksand: {
      200: { normal: 'Quicksand_300Light' },
      300: { normal: 'Quicksand_400Regular' },
      400: { normal: 'Quicksand_500Medium' },
      500: { normal: 'Quicksand_500Medium' },
      600: { normal: 'Quicksand_600SemiBold' },
      700: { normal: 'Quicksand_700Bold' },
    },
  },
  fonts: {
    heading: 'Quicksand',
    body: 'Quicksand',
    mono: 'Quicksand',
  },
});
