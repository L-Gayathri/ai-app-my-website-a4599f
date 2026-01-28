import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    @app.route("/")
    def serve_frontend():
        return send_from_directory(".", "index.html")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "healthy", "message": "My Website backend is running!"})

    posts = [
        {"id": 1, "title": "My First Blog Post", "content": "Welcome to my website! This is the content of the first post."},
        {"id": 2, "title": "Understanding Flask", "content": "Flask is a lightweight WSGI web application framework. It is designed to make getting started quick and easy, with the ability to scale up to complex applications."}
    ]
    next_post_id = 3

    @app.route("/api/posts", methods=["GET"])
    def get_posts():
        return jsonify(posts)

    @app.route("/api/posts", methods=["POST"])
    def create_post():
        nonlocal next_post_id
        data = request.get_json()
        if not data or "title" not in data or "content" not in data:
            return jsonify({"error": "Missing 'title' or 'content' in request body"}), 400
        
        new_post = {
            "id": next_post_id,
            "title": data["title"],
            "content": data["content"]
        }
        posts.append(new_post)
        next_post_id += 1
        return jsonify(new_post), 201

    @app.route("/api/posts/<int:post_id>", methods=["GET"])
    def get_post(post_id):
        post = next((p for p in posts if p["id"] == post_id), None)
        if post:
            return jsonify(post)
        return jsonify({"error": f"Post with ID {post_id} not found"}), 404

    @app.route("/api/posts/<int:post_id>", methods=["PUT"])
    def update_post(post_id):
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided for update"}), 400

        post = next((p for p in posts if p["id"] == post_id), None)
        if not post:
            return jsonify({"error": f"Post with ID {post_id} not found"}), 404
        
        if "title" in data:
            post["title"] = data["title"]
        if "content" in data:
            post["content"] = data["content"]
        
        return jsonify(post)

    @app.route("/api/posts/<int:post_id>", methods=["DELETE"])
    def delete_post(post_id):
        nonlocal posts
        original_len = len(posts)
        posts = [p for p in posts if p["id"] != post_id]
        if len(posts) < original_len:
            return jsonify({"message": f"Post with ID {post_id} deleted successfully"}), 200
        return jsonify({"error": f"Post with ID {post_id} not found"}), 404

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)