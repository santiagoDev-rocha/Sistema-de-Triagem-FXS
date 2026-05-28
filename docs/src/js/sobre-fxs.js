requireAuthWithRole(function(user, role) {
    if (role === 'ADMIN') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    }
});

if (window.lucide) lucide.createIcons();
