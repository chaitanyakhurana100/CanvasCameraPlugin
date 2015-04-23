//
//  CanvasCamera.js
//  PhoneGap iOS Cordova Plugin to capture Camera streaming into a HTML5 Canvas or an IMG tag.
//
//  Created by Diego Araos <d@wehack.it> on 12/29/12.
//
//  MIT License

var exec = require('cordova/exec');
var CanvasCamera = function(){
    var _obj = null;
    var _context = null;
    var _camImage = null;
};

CanvasCamera.prototype.initialize = function(obj) {
    this._obj = obj;
    this._context = obj.getContext("2d");

    this._camImage = new Image();
    this._camImage.onload = function() {
        this.drawImage();
    }.bind(this);
};


CanvasCamera.prototype.start = function(options) {
    cordova.exec(this.capture.bind(this), false, "CanvasCamera", "startCapture", [options]);
};

CanvasCamera.prototype.stop = function() {
    cordova.exec(false, false, "CanvasCamera", "stopCapture", []);
};


CanvasCamera.prototype.capture = function(imgData) {
    if (imgData) {
        this._camImage.src = imgData;
    }
};

CanvasCamera.prototype.setFlashMode = function(flashMode) {
    cordova.exec(function(){}, function(){}, "CanvasCamera", "setFlashMode", [flashMode]);
};

CanvasCamera.prototype.setCameraPosition = function(cameraPosition) {
    cordova.exec(function(){
        this._cameraPosition = cameraPosition;
    }.bind(this), function(){}, "CanvasCamera", "setCameraPosition", [cameraPosition]);
};

CanvasCamera.prototype.drawImage = function() {
    var image = this._camImage;
    var context = this._context;
    var canvasWidth = this._obj.width = this._obj.clientWidth;
    var canvasHeight = this._obj.height = this._obj.clientHeight;

    var desiredWidth = canvasWidth;
    var desiredHeight = canvasHeight;
    if (window.orientation != 90 && window.orientation != -90) {
        desiredWidth = canvasHeight;
        desiredHeight = canvasWidth;
    }

    var imageWidth = image.width;
    var imageHeight = image.height;
    var ratio = Math.min(desiredWidth / imageWidth, desiredHeight / imageHeight);
    var newWidth = imageWidth * ratio;
    var newHeight = imageHeight * ratio;
    var cropX, cropY, cropWidth, cropHeight, aspectRatio = 1;

    context.clearRect(0, 0, desiredWidth, desiredHeight);

    // decide which gap to fill
    if (newWidth < desiredWidth) {
        aspectRatio = desiredWidth / newWidth;
    }
    if (newHeight < desiredHeight) {
        aspectRatio = desiredHeight / newHeight;
    }
    newWidth *= aspectRatio;
    newHeight *= aspectRatio;

    // calc source rectangle
    cropWidth = imageWidth / (newWidth / desiredWidth);
    cropHeight = imageHeight / (newHeight / desiredHeight);

    cropX = (imageWidth - cropWidth) * 0.5;
    cropY = (imageHeight - cropHeight) * 0.5;

    // make sure source rectangle is valid
    if (cropX < 0) cropX = 0;
    if (cropY < 0) cropY = 0;
    if (cropWidth > imageWidth) cropWidth = imageWidth;
    if (cropHeight > imageHeight) cropHeight = imageHeight;

    // rotate context according to orientation
    context.save();
    context.translate(canvasWidth / 2, canvasHeight / 2);
    context.rotate((90 - window.orientation) * Math.PI/180);

    // additional rotate for front facing camera in lanscape orientation
    if (this._cameraPosition === 'front' &&
        (window.orientation === 90 || window.orientation === -90))
    {
        context.rotate((180) * Math.PI/180);
    }

    // fill image in dest. rectangle
    context.drawImage(image,
        cropX, cropY, cropWidth, cropHeight,
        -desiredWidth / 2, -desiredHeight / 2, desiredWidth, desiredHeight);

    context.restore();
};

var CanvasCamera = new CanvasCamera();
module.exports = CanvasCamera;
