"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var applicationModule = require("tns-core-modules/application/application");
var imageAssetModule = require("tns-core-modules/image-asset/image-asset");
var trace = require("tns-core-modules/trace/trace");
var platform = require("tns-core-modules/platform/platform");
var REQUEST_IMAGE_CAPTURE = 3453;
var REQUEST_REQUIRED_PERMISSIONS = 1234;
exports.takePicture = function (options) {
    return new Promise(function (resolve, reject) {
        try {
            if (android.support.v4.content.ContextCompat.checkSelfPermission(applicationModule.android.currentContext, android.Manifest.permission.CAMERA) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
                reject(new Error("Application does not have permissions to use Camera"));
                return;
            }
            var types = require("tns-core-modules/utils/types");
            var utils = require("tns-core-modules/utils/utils");
            var saveToGallery_1;
            var reqWidth_1;
            var reqHeight_1;
            var shouldKeepAspectRatio_1;
            var density = utils.layout.getDisplayDensity();
            if (options) {
                saveToGallery_1 = options.saveToGallery ? true : false;
                reqWidth_1 = options.width ? options.width * density : 0;
                reqHeight_1 = options.height ? options.height * density : reqWidth_1;
                shouldKeepAspectRatio_1 = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
            }
            if (android.support.v4.content.ContextCompat.checkSelfPermission(applicationModule.android.currentContext, android.Manifest.permission.WRITE_EXTERNAL_STORAGE) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
                saveToGallery_1 = false;
            }
            var takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            var dateStamp = createDateTimeStamp();
            var picturePath_1;
            var nativeFile = void 0;
            var tempPictureUri = void 0;
            if (saveToGallery_1) {
                picturePath_1 = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).getAbsolutePath() + "/Camera/" + "NSIMG_" + dateStamp + ".jpg";
                nativeFile = new java.io.File(picturePath_1);
            }
            else {
                picturePath_1 = utils.ad.getApplicationContext().getExternalFilesDir(null).getAbsolutePath() + "/" + "NSIMG_" + dateStamp + ".jpg";
                nativeFile = new java.io.File(picturePath_1);
            }
            var sdkVersionInt = parseInt(platform.device.sdkVersion);
            if (sdkVersionInt >= 21) {
                tempPictureUri = android.support.v4.content.FileProvider.getUriForFile(applicationModule.android.currentContext, applicationModule.android.nativeApp.getPackageName() + ".provider", nativeFile);
            }
            else {
                tempPictureUri = android.net.Uri.fromFile(nativeFile);
            }
            takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);
            if (options && options.cameraFacing === "front") {
                takePictureIntent.putExtra("android.intent.extras.CAMERA_FACING", android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT);
            }
            if (takePictureIntent.resolveActivity(utils.ad.getApplicationContext().getPackageManager()) != null) {
                var appModule_1 = require("tns-core-modules/application");
                appModule_1.android.off("activityResult");
                appModule_1.android.on("activityResult", function (args) {
                    var requestCode = args.requestCode;
                    var resultCode = args.resultCode;
                    if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {
                        if (saveToGallery_1) {
                            try {
                                var callback = new android.media.MediaScannerConnection.OnScanCompletedListener({
                                    onScanCompleted: function (path, uri) {
                                        if (trace.isEnabled()) {
                                            trace.write("image from path " + path + " has been successfully scanned!", trace.categories.Debug);
                                        }
                                    }
                                });
                                android.media.MediaScannerConnection.scanFile(appModule_1.android.context, [picturePath_1], null, callback);
                            }
                            catch (ex) {
                                if (trace.isEnabled()) {
                                    trace.write("An error occurred while scanning file " + picturePath_1 + ": " + ex.message + "!", trace.categories.Debug);
                                }
                            }
                        }
                        var exif = new android.media.ExifInterface(picturePath_1);
                        var orientation_1 = exif.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION, android.media.ExifInterface.ORIENTATION_NORMAL);
                        if (orientation_1 === android.media.ExifInterface.ORIENTATION_ROTATE_90) {
                            rotateBitmap(picturePath_1, 90);
                        }
                        else if (orientation_1 === android.media.ExifInterface.ORIENTATION_ROTATE_180) {
                            rotateBitmap(picturePath_1, 180);
                        }
                        else if (orientation_1 === android.media.ExifInterface.ORIENTATION_ROTATE_270) {
                            rotateBitmap(picturePath_1, 270);
                        }
                        var asset = new imageAssetModule.ImageAsset(picturePath_1);
                        asset.options = {
                            width: reqWidth_1,
                            height: reqHeight_1,
                            keepAspectRatio: shouldKeepAspectRatio_1
                        };
                        resolve(asset);
                    }
                    else if (resultCode === android.app.Activity.RESULT_CANCELED) {
                        reject(new Error("cancelled"));
                    }
                });
                appModule_1.android.foregroundActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
            }
        }
        catch (e) {
            if (reject) {
                reject(e);
            }
        }
    });
};
exports.isAvailable = function () {
    var utils = require("tns-core-modules/utils/utils");
    return utils.ad
        .getApplicationContext()
        .getPackageManager()
        .hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA);
};
exports.requestPermissions = function () {
    if (android.support.v4.content.ContextCompat.checkSelfPermission(applicationModule.android.currentContext, android.Manifest.permission.WRITE_EXTERNAL_STORAGE) !== android.content.pm.PackageManager.PERMISSION_GRANTED ||
        android.support.v4.content.ContextCompat.checkSelfPermission(applicationModule.android.currentContext, android.Manifest.permission.CAMERA) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
        android.support.v4.app.ActivityCompat.requestPermissions(applicationModule.android.currentContext, [
            android.Manifest.permission.CAMERA,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE
        ], REQUEST_REQUIRED_PERMISSIONS);
    }
};
var createDateTimeStamp = function () {
    var result = "";
    var date = new Date();
    result = date.getFullYear().toString() +
        ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString()) +
        (date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString()) + "_" +
        date.getHours().toString() +
        date.getMinutes().toString() +
        date.getSeconds().toString();
    return result;
};
var rotateBitmap = function (picturePath, angle) {
    try {
        var matrix = new android.graphics.Matrix();
        matrix.postRotate(angle);
        var bmOptions = new android.graphics.BitmapFactory.Options();
        var oldBitmap = android.graphics.BitmapFactory.decodeFile(picturePath, bmOptions);
        var finalBitmap = android.graphics.Bitmap.createBitmap(oldBitmap, 0, 0, oldBitmap.getWidth(), oldBitmap.getHeight(), matrix, true);
        var out = new java.io.FileOutputStream(picturePath);
        finalBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, out);
        out.flush();
        out.close();
    }
    catch (ex) {
        if (trace.isEnabled()) {
            trace.write("An error occurred while rotating file " + picturePath + " (using the original one): " + ex.message + "!", trace.categories.Debug);
        }
    }
};
//# sourceMappingURL=camera.js.map