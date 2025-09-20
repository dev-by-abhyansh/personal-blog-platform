document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Setup and Checks ---
    const activeBlogName = localStorage.getItem('activeBlogName');
    
    if (!activeBlogName) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('blog-title-heading').textContent = activeBlogName;

    // Get references to HTML elements
    const postsContainer = document.getElementById('posts-container');
    const addPostForm = document.getElementById('add-post-form');
    const postTitleInput = document.getElementById('post-title');
    const postContentInput = document.getElementById('post-content');
    const postImageUrlInput = document.getElementById('post-image-url'); // NEW
    const searchBar = document.getElementById('search-bar');

    const editModalElement = document.getElementById('editPostModal');
    const editModal = new bootstrap.Modal(editModalElement);
    const editPostTitleInput = document.getElementById('edit-post-title');
    const editPostContentInput = document.getElementById('edit-post-content');
    const editPostImageUrlInput = document.getElementById('edit-post-image-url'); // NEW
    const saveEditBtn = document.getElementById('save-edit-btn');
    
    let allBlogs = {};
    let posts = [];
    let currentEditingId = null;

    // --- Function to LOAD posts from the main data object ---
    const loadPosts = () => {
        allBlogs = JSON.parse(localStorage.getItem('allMyBlogs')) || {};
        posts = allBlogs[activeBlogName] || [];
        renderPosts();
    };

    // --- Function to SAVE posts back to the main data object ---
    const savePosts = () => {
        allBlogs[activeBlogName] = posts;
        localStorage.setItem('allMyBlogs', JSON.stringify(allBlogs));
    };
    
    // --- Function to DISPLAY posts on the page ---
    const renderPosts = (postsToRender = posts) => {
        postsContainer.innerHTML = '';
        if (postsToRender.length === 0) {
            postsContainer.innerHTML = '<p class="text-white">No posts found.</p>';
            return;
        }
        postsToRender.forEach(post => {
            const col = document.createElement('div');
            col.classList.add('col-md-6', 'col-lg-4', 'mb-4');

            // MODIFIED: Conditionally add an <img> tag if post.imageUrl exists
            const imageHtml = post.imageUrl 
                ? `<img src="${post.imageUrl}" class="card-img-top" alt="${post.title}" style="height: 200px; object-fit: cover;">` 
                : '';

            col.innerHTML = `
                <div class="card h-100 text-white" style="background-color: #222;">
                    ${imageHtml}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${post.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${post.date}</h6>
                        <div class="card-text flex-grow-1">${marked.parse(post.content)}</div>
                    </div>
                    <div class="card-footer text-end">
                        <button class="btn btn-sm btn-outline-light edit-btn" data-id="${post.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn ms-2" data-id="${post.id}">Delete</button>
                    </div>
                </div>
            `;
            postsContainer.appendChild(col);
        });
    };

    // --- Function to ADD a new post ---
    const addPost = (title, content, imageUrl) => { // MODIFIED
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            imageUrl: imageUrl, // MODIFIED
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };
        posts.unshift(newPost);
        savePosts();
        renderPosts();
    };
    
    // --- Event Listeners ---
    addPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();
        const imageUrl = postImageUrlInput.value.trim(); // NEW
        if (title && content) {
            addPost(title, content, imageUrl); // MODIFIED
            addPostForm.reset();
        }
    });

    postsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const postId = Number(e.target.dataset.id);
            const postToEdit = posts.find(post => post.id === postId);
            if (postToEdit) {
                currentEditingId = postId;
                editPostTitleInput.value = postToEdit.title;
                editPostContentInput.value = postToEdit.content;
                editPostImageUrlInput.value = postToEdit.imageUrl || ''; // MODIFIED
                editModal.show();
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            const postId = Number(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this post?')) {
                posts = posts.filter(post => post.id !== postId);
                savePosts();
                renderPosts();
            }
        }
    });

    saveEditBtn.addEventListener('click', () => {
        const newTitle = editPostTitleInput.value.trim();
        const newContent = editPostContentInput.value.trim();
        const newImageUrl = editPostImageUrlInput.value.trim(); // NEW
        if (newTitle && newContent && currentEditingId !== null) {
            const postIndex = posts.findIndex(post => post.id === currentEditingId);
            if (postIndex !== -1) {
                posts[postIndex].title = newTitle;
                posts[postIndex].content = newContent;
                posts[postIndex].imageUrl = newImageUrl; // MODIFIED
            }
            savePosts();
            renderPosts();
            editModal.hide();
            currentEditingId = null;
        }
    });

    searchBar.addEventListener('keyup', () => {
        const searchTerm = searchBar.value.toLowerCase();
        
        const filteredPosts = posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const contentMatch = post.content.toLowerCase().includes(searchTerm);
            return titleMatch || contentMatch;
        });
        
        renderPosts(filteredPosts);
    });

    // --- Initial Load ---
    loadPosts();
});