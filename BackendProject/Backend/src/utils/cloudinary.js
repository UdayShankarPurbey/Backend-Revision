import { response } from 'express';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { extractPublicId } from 'cloudinary-build-url';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET ,
  secure: true,

});

const uploadOnCloudinary = async (localFilePath , resourceType) => {
    try {
        if(! localFilePath && ! resourceType)  return  null;

        let response;
        if(resourceType == 'video') {
            response = await cloudinary.uploader.upload(localFilePath , {
                resource_type : resourceType,
                folder: 'Twityou/Videos',
            })
        } else if (resourceType == 'image') {
            response = await cloudinary.uploader.upload(localFilePath , {
                resource_type : resourceType,
                folder: 'Twityou/Images',
            })
        } else {
            console.error(`Invalid resource type: ${resourceType}`);
            return null;
        }
        
        if(response) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.error(error);
    }
}

const removeFromCloudinary = async (publicUrl ,resourceType ) => {
    try {
        if(! publicUrl && ! resourceType)  return  null;
        const publicId = extractPublicId(publicUrl) 
        let response;
        if(resourceType == 'video') {
            response = await cloudinary.api.delete_resources(publicId ,{ type: 'upload', resource_type: 'video' })
        } else if (resourceType == 'image') {
            response = await cloudinary.api.delete_resources(publicId ,{ type: 'upload', resource_type: 'image' })
        } else {
            console.error(`Invalid resource type: ${resourceType}`);
            return null;
        }
        
        return response;
    } catch (error) {
        console.error(error);
    }
   

   
  

  
  
 
  
}

export { uploadOnCloudinary , removeFromCloudinary }