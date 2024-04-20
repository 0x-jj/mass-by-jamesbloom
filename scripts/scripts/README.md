# Dynamic Updates
## Speed of rotation
The speed and direction of rotation is changed using the updateObjectRotationSpeed() function that takes 4 parameters: shape name, axis name, new speed, change speed

## To change speed of rotation of the third conoe on the "major" axis:
```
updateObjectRotationSpeed("cone3", "major", 100, 0.5);
```

## Change the direction of rotation
switchObjectRotationDirection("cone3", "major", 0.1);

## To change the scale of the background gradient
```
updateBackgroundGradientScale(2.8, 0.01);
```

## Change the distance of the first cone from the center of the axis
```
updateObjectDistanceFromAxis("cone1", "major", -10, 0.1);
```

## Increase the background gradient animation speed with 10%
```
increaseBackgroundGradientAnimationSpeed(1.1);
```

## Change position of camera
```
updateCameraPosition(10, undefined, undefined, 0.1);
```

## Change scale of objects
```
updateObjectScale("cone2", "major", 10, 0.05);
```

## Change fog vanishing point
```
updateVanishingPoint(5,6,0.05)
```

## Change fog color
```
updateFogColor("#FF00FF",0.1)
```

## Add extra shape to the "major" axis
```
addNewShape("major", "c1", "frame", 1);
```

## Add cone to the major axis
```
addNewShape("major", "c1", "cone", 1)
```

## Move axis
```
moveAxis("major",-150, undefined, undefined, 0.01, 0.1)
```

## Rotate axis
```
rotateAxis("major",undefined,undefined,90, 0.01, 0.1)
```

## Lightning
This function takes the following arguments:
axisName: The axis name
objectName: The object name (can be terrain or any other object)
zapColor: The color of the lightning
zapSize: The size of a zap line (the zig-zag segments)
zapAmplitude: The offsite of the edge/corner of the zig-zag
nZaps: The numebr of segments
zapWidth: The width of the line
duration: How long the lightning will be active until it dissapears. The value is in frames.

The zapSize, zapAmplitude, nZaps, zapWidth and duration parameters can be signgles or ranges.
The zapColor can be single value or list of values, if it is a list one of the values will be selected.

```
zapTerrain("major", "terrain1", ["#FFc300", "#00FF00", "#0000FF"], 1, 1, [5,15,1], [1,5,1], [10,100,10])
```

```
zapTerrain("major", "terrain1", "#FFc300", 1, 1, 10, 3, 100)
```

# Looping animations

## To add looping rotation animation to cone0 on axis0 on the X axis with speed 1
addRotationLoop("cone0", "axis0", "X", 1)

## To remove looping rotation animation
removeRotationLoop("cone0", "axis0", "X", 1)

# Camera controls
W,A,S,D to move around
E to move forward
Q to move back

------------------------------------------------------------------------------------------

# Updates

23-03-16
 - Token hash
 - Looping animations
 - Camera controls
 - Arrow types 0, 1, 2, 3
 - Added specialCone1 and specialCone2 cone types
 - Added secondColor parameter to flowers

23-03-22
 - Object rotation loops happen on global axis
 - Texture offset parameter for all extra shapes
 - Texture scale parameter for all extra shapes
 - 3 palettes added to prototypes
 - number of cones added to prototypes
 - texture color added to prototypes
 - fog enable/disable + color added to prototypes via palettes
 - world gradients added to prototypes via palettes