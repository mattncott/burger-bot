import * as tf from "@tensorflow/tfjs-node";
import { ClassificationResult } from "../../Types/ClassificationResult";

export default interface ITensorFlow {
    ImageToTensor(rawImageData: ArrayBuffer): tf.Tensor3D;
    Classify(image: any): Promise<ClassificationResult[]>;
}