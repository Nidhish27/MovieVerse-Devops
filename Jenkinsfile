pipeline {
    agent any

    environment {
        IMAGE_NAME = "nidhish27/movieverse"
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_SERVER = "13.126.196.81"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/Nidhish27/MovieVerse-Devops.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_ed25519 ubuntu@${K8S_SERVER} \
                    "cd ~/MovieVerse-Devops && \
                    git pull origin main && \
                    kubectl rollout restart deployment movieverse && \
                    kubectl rollout status deployment/movieverse"
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_ed25519 ubuntu@${K8S_SERVER} \
                    "kubectl get pods && kubectl get svc"
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -af || true'
            }
        }

    }

    post {

        success {
            echo '✅ MovieVerse successfully built, pushed and deployed to Kubernetes!'
        }

        failure {
            echo '❌ Pipeline Failed!'
        }

        always {
            cleanWs()
        }

    }
}