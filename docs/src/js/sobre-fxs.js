requireAuthWithRole(function(user, role) {
    if (role === 'MEDICO') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) {
            el.style.display = 'none';
        });
    }
});

if (window.lucide) lucide.createIcons();
