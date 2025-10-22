const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : '/Portfolio/';

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'about/', title: 'About' },
  { url: 'https://github.com/chillingandcoding', title: 'Profile' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !url.startsWith('http') ? BASE_PATH + url : url;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);
  a.classList.toggle(
    'current',
    a.host === location.host && (
      a.pathname === location.pathname || location.pathname.includes('/proj/')
    )
  );
  if (a.host !== location.host) a.target = '_blank';
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
		</select>
	</label>`,
);

const select = document.querySelector('.color-scheme select');

if ('colorScheme' in localStorage) {
  const saved = localStorage.colorScheme;
  document.documentElement.style.setProperty('color-scheme', saved);
  select.value = saved;
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  projects.forEach(project => {
    const pathname = window.location.pathname;
    const inProjects = pathname.includes('/projects');
    const projectUrl = inProjects
      ? `./${project.url}`
      : `/Portfolio/projects/${project.url}`;
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <a href="${projectUrl}">
        <img src="${project.image}" alt="${project.title}">
      </a>
      ${project.year ? `<p class="year">${project.year}</p>` : ''}
      <p>${project.description}</p>
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}


