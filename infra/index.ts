import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Define the Docker image
const image = new gcp.cloudbuild.Trigger("nestjs-image", {
    filename: "cloudbuild.yaml",
    substitutions: {
        _IMAGE_NAME: "gcr.io/$PROJECT_ID/nestjs-image",
    },
    includedFiles: ["nest-gcp/Dockerfile"],
});

// Define the Cloud Run service
const service = new gcp.cloudrunv2.Service("nestjs-service", {
    location: "us-central1",
    template: {
        containers: [{
            image: pulumi.interpolate`gcr.io/${gcp.config.project}/nestjs-image`,
            ports: [{ containerPort: 8080 }],
        }],
    },
    traffics: [{
        type: "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST",
        percent: 100,
    }],
});

// Export the URL of the deployed service
export const serviceUrl = service.statuses[0].url;