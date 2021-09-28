const initialState = {
    hue: "360",
    saturation: 80,
    lightness: 75,
    thickness: 5,
    opacity: 1,
    animValue: {
        baseScale: 1,
        transX: 0,
        transY: 0,
    },
    isDrawing: true,
    drawingModal: false,
    erasingModal: false,
    colorArr: [],
};
export default function (state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
        case 'SET_HUE':
            console.log("Type: ",type," Value: ",payload);
            return {...state, hue: payload};

        case 'SET_SATURATION':
            console.log("Type: ",type," Value: ",payload);
            return {...state, saturation: payload};

        case 'SET_LIGHTNESS':
            console.log("Type: ",type," Value: ",payload);
            return {...state, lightness: payload};

        case 'SET_THICKNESS':
            console.log("Type: ",type," Value: ",payload);
            return {...state, thickness: payload};

        case 'SET_OPACITY':
            console.log("Type: ",type," Value: ",payload);
            return {...state, opacity: payload};

        case 'SET_SCALE':
            state.animValue = payload;
            console.log("Scale: ", state.animValue);

        case 'SET_DRAWING':
            return {...state, isDrawing: payload};

        case 'SET_DRAWING_MODAL':
            return {...state, drawingModal: payload};

        case 'SET_ERASING_MODAL':
            return {...state, erasingModal: payload};
    
        default:
            return {...state};
    }
}