import ITensorFlow from "./Interfaces/ITensorFlow";
import { ClassificationResult } from "../Types/ClassificationResult";

import * as mobilenet from "@tensorflow-models/mobilenet";
import * as jpeg from "jpeg-js";
import { Tensor3D, tensor3d } from "@tensorflow/tfjs-node";

export default class TensorFlow implements ITensorFlow {
    
    public ImageToTensor(rawImageData: ArrayBuffer): Tensor3D {
        const { width, height, data } = jpeg.decode(rawImageData, {useTArray: true});
        // Drop the alpha channel info for mobilenet
        const buffer = new Uint8Array(width * height * 3);
        let offset = 0; // offset into original data
        for (let i = 0; i < buffer.length; i += 3) {
          buffer[i] = data[offset];
          buffer[i + 1] = data[offset + 1];
          buffer[i + 2] = data[offset + 2];
    
          offset += 4;
        }
    
        return tensor3d(buffer, [height, width, 3]);
    }
    
    public async Classify(image: any): Promise<ClassificationResult[]> {
        const model = await mobilenet.load();
        return await model.classify(image, 3) as unknown as ClassificationResult[];
    }
}

