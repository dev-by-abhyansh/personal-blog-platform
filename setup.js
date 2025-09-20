document.addEventListener('DOMContentLoaded', () => {
    // Get references to the two main views
    const initialSetupView = document.getElementById('initial-setup');
    const blogManagerView = document.getElementById('blog-manager');
    const blogListContainer = document.getElementById('blog-list');

    // Get references to the forms and inputs
    const initialForm = document.getElementById('new-blog-form-initial');
    const initialInput = document.getElementById('initial-blog-name');
    const managerForm = document.getElementById('new-blog-form-manager');
    const managerInput = document.getElementById('new-blog-name');

    // --- Main Function to Load and Display Blogs ---
    const loadBlogManager = () => {
        const allBlogs = JSON.parse(localStorage.getItem('allMyBlogs')) || {};
        const blogNames = Object.keys(allBlogs);

        if (blogNames.length === 0) {
            // No blogs exist yet, show the initial setup form
            initialSetupView.classList.remove('d-none');
            blogManagerView.classList.add('d-none');
        } else {
            // Blogs exist, show the manager view
            initialSetupView.classList.add('d-none');
            blogManagerView.classList.remove('d-none');
            
            // MODIFIED: Added a Rename button to each list item
            blogListContainer.innerHTML = '';
            blogNames.forEach(name => {
                const listItem = document.createElement('div');
                listItem.className = 'list-group-item bg-dark text-white d-flex justify-content-between align-items-center';

                // Blog name that acts as a link
                const blogLink = document.createElement('a');
                blogLink.href = '#';
                blogLink.className = 'text-white text-decoration-none flex-grow-1';
                blogLink.textContent = name;
                blogLink.dataset.name = name;
                
                // Container for the buttons
                const buttonsDiv = document.createElement('div');

                // Rename button
                const renameBtn = document.createElement('button');
                renameBtn.className = 'btn btn-sm btn-outline-info rename-blog-btn';
                renameBtn.textContent = 'Rename';
                renameBtn.dataset.name = name;

                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-outline-danger delete-blog-btn ms-2';
                deleteBtn.textContent = 'Delete';
                deleteBtn.dataset.name = name;

                buttonsDiv.appendChild(renameBtn);
                buttonsDiv.appendChild(deleteBtn);
                listItem.appendChild(blogLink);
                listItem.appendChild(buttonsDiv);
                blogListContainer.appendChild(listItem);
            });
        }
    };

    // --- Function to Create a New Blog ---
    const createNewBlog = (blogName) => {
        if (!blogName) return;
        let allBlogs = JSON.parse(localStorage.getItem('allMyBlogs')) || {};
        if (allBlogs[blogName]) {
            alert('A blog with this name already exists!');
            return;
        }
        allBlogs[blogName] = [];
        localStorage.setItem('allMyBlogs', JSON.stringify(allBlogs));
        localStorage.setItem('activeBlogName', blogName);
        window.location.href = 'blog.html';
    };

    // --- Event Listeners ---
    initialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createNewBlog(initialInput.value.trim());
    });

    managerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const blogName = managerInput.value.trim();
        if (blogName) {
            createNewBlog(blogName);
        }
        managerInput.value = '';
    });

    // MODIFIED: Event listener now also handles Rename button clicks
    blogListContainer.addEventListener('click', (e) => {
        const target = e.target;

        // Handle clicking on a blog name to navigate
        if (target.tagName === 'A' && target.dataset.name) {
            e.preventDefault();
            localStorage.setItem('activeBlogName', target.dataset.name);
            window.location.href = 'blog.html';
        }

        // Handle clicking the rename button
        if (target.classList.contains('rename-blog-btn')) {
            e.preventDefault();
            const oldBlogName = target.dataset.name;
            const newBlogName = prompt('Enter the new name for your blog:', oldBlogName);
            
            if (newBlogName && newBlogName.trim() !== '' && newBlogName !== oldBlogName) {
                let allBlogs = JSON.parse(localStorage.getItem('allMyBlogs'));
                if (allBlogs[newBlogName]) {
                    alert('A blog with that name already exists. Please choose a different name.');
                    return;
                }
                
                // Re-assign the posts to the new name and delete the old one
                allBlogs[newBlogName] = allBlogs[oldBlogName];
                delete allBlogs[oldBlogName];

                localStorage.setItem('allMyBlogs', JSON.stringify(allBlogs));

                // If the renamed blog was the active one, update the active name
                if (localStorage.getItem('activeBlogName') === oldBlogName) {
                    localStorage.setItem('activeBlogName', newBlogName);
                }

                loadBlogManager(); // Refresh the list
            }
        }

        // Handle clicking the delete button
        if (target.classList.contains('delete-blog-btn')) {
            e.preventDefault();
            const blogName = target.dataset.name;

            if (confirm(`Are you sure you want to delete the entire blog "${blogName}"? This action cannot be undone.`)) {
                let allBlogs = JSON.parse(localStorage.getItem('allMyBlogs'));
                
                delete allBlogs[blogName];
                localStorage.setItem('allMyBlogs', JSON.stringify(allBlogs));

                if (localStorage.getItem('activeBlogName') === blogName) {
                    localStorage.removeItem('activeBlogName');
                }

                loadBlogManager();
            }
        }
    });

    // --- Initial Load ---
    loadBlogManager();
});