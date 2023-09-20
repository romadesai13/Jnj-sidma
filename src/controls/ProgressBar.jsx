import React from 'react'

const ProgressBar = ({ bgcolor, progress, height }) => {

    const Parentdiv = {
        height: height,
        width: '100%',
        backgroundColor: 'red',
        borderRadius: 40,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between'
    }

    const Childdiv = {
        height: '100%',
        width: `${progress}%`,
        backgroundColor: bgcolor,
        borderRadius: 40,
    }

    const Childdiv2 = {
        height: '100%',
        width: `${100 - progress}%`,
        backgroundColor: 'red',
        borderRadius: 40,
    }

    const progresstext = {
        padding: 5,
        color: 'black',
        fontWeight: 600
    }

    return (
        <div style={Parentdiv}>
            <div style={Childdiv}>
                <div style={progresstext}>{`${progress}%`}</div>
            </div>
            <div style={Childdiv2}>
                <div style={progresstext}>{`${100 - progress}%`}</div>
            </div>
        </div>
    )
}

export default ProgressBar;
