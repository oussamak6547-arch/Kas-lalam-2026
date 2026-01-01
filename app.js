async function loadMatches(){
  const res = await fetch('data/matches.json');
  const data = await res.json();
  return data.matches || [];
}

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

function createStatusEl(status){
  const span = document.createElement('span');
  span.className = 'status';
  if(status === 'upcoming') { span.classList.add('upcoming'); span.textContent = 'قبل المباراة'; }
  else if(status === 'live') { span.classList.add('live'); span.textContent = 'مباشر'; }
  else { span.classList.add('finished'); span.textContent = 'انتهت'; }
  return span;
}

function renderMatches(matches){
  const container = document.getElementById('matches');
  container.innerHTML = '';

  if(!matches.length){
    container.innerHTML = '<p style="text-align:center;color:#9aa4b2">لا توجد مباريات للعرض</p>';
    return;
  }

  for(const m of matches){
    const el = document.createElement('article');
    el.className = 'match';

    el.innerHTML = `
      <div class="teams">
        <div class="team">
          <div>${m.home_team}</div>
          <small class="meta">ملعب: ${m.stadium || '-'} </small>
        </div>

        <div class="score">${m.home_score != null && m.away_score != null ? m.home_score + ' - ' + m.away_score : '-'}</div>

        <div class="team">
          <div>${m.away_team}</div>
          <small class="meta">الدوري: ${m.league}</small>
        </div>
      </div>
      <div class="meta">${formatDate(m.utc_date)} • ${m.round || ''}</div>
    `;

    el.appendChild(createStatusEl(m.status));
    container.appendChild(el);
  }
}

function populateLeagues(matches){
  const sel = document.getElementById('leagueFilter');
  const leagues = [...new Set(matches.map(m=>m.league))].sort();
  for(const l of leagues){
    const opt = document.createElement('option');
    opt.value = l; opt.textContent = l; sel.appendChild(opt);
  }
}

function applyFilters(all){
  const league = document.getElementById('leagueFilter').value;
  const date = document.getElementById('dateFilter').value; // YYYY-MM-DD

  let filtered = all.slice();
  if(league && league !== 'all') filtered = filtered.filter(m=>m.league === league);
  if(date) filtered = filtered.filter(m=> m.utc_date.startsWith(date));

  renderMatches(filtered);
}

(async function(){
  const matches = await loadMatches();
  populateLeagues(matches);
  renderMatches(matches);

  document.getElementById('leagueFilter').addEventListener('change', ()=>applyFilters(matches));
  document.getElementById('dateFilter').addEventListener('change', ()=>applyFilters(matches));
  document.getElementById('clearFilters').addEventListener('click', ()=>{
    document.getElementById('leagueFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    renderMatches(matches);
  });
})();