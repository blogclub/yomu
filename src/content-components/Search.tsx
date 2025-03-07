
import * as animeflix from '../content-source/animeflix.ts';
import * as discord from '../content-source/discord-api.ts';
import * as State from '../core/State.ts';
import * as sideMenuUtils from '../utils/SideMenu.ts';

import { MangaEntry } from '../content-source/mangakakalot.ts';
import '../stylings/content/search.css';
import MangaDetails from './MangaDetails.tsx';

import ClearIcon from '@mui/icons-material/Clear';

import { Autocomplete, Chip, MenuItem, Paper, styled } from '@mui/material';
import TextField from '@mui/material/TextField';
import React from 'react';

let currentPage = 1;
let query = "";

//TODO: add elements per page filter
//TODO: add element size option

function addMetaInfo(details: HTMLElement, titleText: string){
      // add a title to the details section

      const hbox = document.createElement('div');
      hbox.setAttribute('class', 'hbox1');

      const container = document.createElement('div');
      container.setAttribute('class', 'grid-item-container');

      const title = document.createElement('div');
      title.setAttribute('class', 'grid-item-title');
      title.textContent = titleText; // set text content directly
      container.appendChild(title);

      console.log(">> " + titleText);

      hbox.appendChild(container);

      details.appendChild(hbox);
}

function clearGrid(){
  const searchGrid = document.querySelector('.search-grid');

  if (searchGrid === null) {
    return;
  }

  searchGrid.innerHTML = '';
}

function startLoadingAnimation() {
  const searchGrid = document.querySelector('.search-grid');

  if (searchGrid === null) {
    return;
  }

  clearGrid();

  const loading = document.createElement('div');
  loading.setAttribute('class', 'loading');
  searchGrid.appendChild(loading);
}

function showMore(){
  startLoadingAnimation();
}



function search(event: any) {

  if (event.keyCode === 13) {
    currentPage = 1;
    searchAnime();
  }
}

function getUrlParameter() {
  //get the value from all the other inputs
  const season_select = document.getElementById('season-select') as HTMLInputElement;
  const season_text = season_select.innerHTML;

  const format_select = document.getElementById('format-select') as HTMLInputElement;
  const format_text = format_select.innerHTML;

  const airing_status_select = document.getElementById('airing-status-select') as HTMLInputElement;
  const airing_status_text = airing_status_select.innerHTML;

  const sorted_select = document.getElementById('sorted-select') as HTMLInputElement;

  //grab the key from the value of the select
  const sorted_text = Object.keys(Sort).find(key => Sort[key] === sorted_select.innerHTML);

  const nsfw_select = document.getElementById('nsfw-select') as HTMLInputElement;
  const nsfw_text = nsfw_select.innerHTML;

  const items_select = document.getElementById('items-select') as HTMLInputElement;
  const items_text = items_select.innerHTML;

  console.log(value);

  const filtersURL = '&season=' + season_text + '&format=' + format_text + '&status=' + airing_status_text + '&sort=' + sorted_text + '&nsfw=' + nsfw_text + '&tags=' + value + '&items_select=' + items_text + '&page=' + currentPage;
  return filtersURL;
}

function searchAnime() {
  const searchGrid = document.querySelector('.search-grid');

  if (searchGrid === null) {
    return;
  }

  startLoadingAnimation();

  discord.setSearching();

  const search_input = document.getElementById('search-input') as HTMLInputElement;
  const search_text = search_input.value;
  query = search_text;

  //get the value from all the other inputs
  const filtersURL = getUrlParameter();

  animeflix.search(search_text, filtersURL).then((entries) => {
    
    clearGrid();
    loadItems(entries, "search-search-grid");
  });
  
}

function loadItems(result: any, container: string) {

  const ids = result.media;

  ids.forEach((data: any) => {

    const entry = data;

    if(entry.progress === undefined || entry.progress === null){
       entry.progress = 0;
    }

    // Create child element with class 'profile-anime-entry'
    const animeEntryElement = document.createElement('div');
    animeEntryElement.classList.add('profile-anime-entry');

    // Create child element with class 'profile-anime-entry-header'
    const animeEntryHeaderElement = document.createElement('div');
    animeEntryHeaderElement.classList.add('profile-anime-entry-header');

    // Create child element with class 'profile-anime-entry-content'
    const animeEntryContentElement = document.createElement('div');
    animeEntryContentElement.classList.add('profile-anime-entry-content');

    // Create h1 element with id 'profile-anime-entry-title'
    const titleElement = document.createElement('h1');
    titleElement.setAttribute('id', 'profile-anime-entry-title');
    titleElement.textContent = entry.title.romaji;

    const maxLength : number = 60;

    if(titleElement.textContent != undefined && titleElement.textContent?.length > maxLength){
      //titleElement.style.fontSize = '1rem';
      titleElement.textContent = titleElement.textContent.substring(0, maxLength).trim() + '...';
    }


    let score = Math.floor(entry.averageScore / 20);

    let width = "24";
    let height = "24";
    let colour = "gray";

    // Append child elements to their respective parents
    animeEntryContentElement.appendChild(titleElement);
    animeEntryElement.appendChild(animeEntryHeaderElement);
    animeEntryElement.appendChild(animeEntryContentElement);

    animeEntryHeaderElement.style.backgroundImage = `url(${entry.coverImage.extraLarge})`;

    // Append the parent element to the desired container in your HTML document
    const containerElement = document.getElementById(container);
    containerElement?.appendChild(animeEntryElement);


    //add ratings
    const starElement = document.createElement('div');
    starElement.setAttribute('id', 'profile-anime-entry-star');

    for(let i = 0; i < score; i++){
      const star_icon = document.createElement('div');
      star_icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="${colour}" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
      </svg>`;

      starElement.appendChild(star_icon);
    }

    if(entry.averageScore % 20 > 10){
      const star_half_icon = document.createElement('div');

      star_half_icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="${colour}" class="bi bi-star-half" viewBox="0 0 16 16">
      <path d="M5.354 5.119 7.538.792A.516.516 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.537.537 0 0 1 16 6.32a.548.548 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.52.52 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.58.58 0 0 1 .085-.302.513.513 0 0 1 .37-.245l4.898-.696zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.565.565 0 0 1 .162-.505l2.907-2.77-4.052-.576a.525.525 0 0 1-.393-.288L8.001 2.223 8 2.226v9.8z"/>
      </svg>`;

      starElement.appendChild(star_half_icon);
      score++;
    }

    for(let i = 0; i < 5 - score; i++){
      const star_empty_icon = document.createElement('div');

      star_empty_icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="${colour}" class="bi bi-star" viewBox="0 0 16 16">
      <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
      </svg>`;

      starElement.appendChild(star_empty_icon);
    }

    animeEntryContentElement.appendChild(starElement);

    // // Add mouseover event listener to animeEntryElement
    // detailsElement.addEventListener('mouseover', function() {
    //   detailsElement.style.opacity = '1';
    // });

    // // Add mouseout event listener to animeEntryElement
    // detailsElement.addEventListener('mouseout', function() {
    //   detailsElement.style.opacity = '1';
    // });

    if(containerElement === null){	
      return;
    }
  
    containerElement.appendChild(animeEntryElement);

    // detailsElement.addEventListener('mousedown', () => {
    //   // discord.setWatchingAnime(entry.title.romaji, parseInt(episode), entry.episodes, entry.coverImage.extraLarge);
    //   // animeflix.updateEpisodeForUser(entry, episode);
    //   const url = 'https://anilist.co/anime/' + data.id + '/';
    //   shell.openExternal(url);

    // });

    animeEntryElement.addEventListener('click', () => {

      const queryEntry: MangaEntry = {
        manga: {
          id:  entry.id,
          alt: entry.title.romaji,
          img: entry.coverImage.extraLarge,
        },
      };

      const state = <MangaDetails entry={queryEntry}/>;

      State.updateState(state);
    });

  });

  if(result.pageInfo.hasNextPage){
    //add the show more button with the class 'show-more-element' which is simply an icon

    const backgroundDiv = document.createElement('div');
    backgroundDiv.setAttribute('class', 'background-div profile-anime-entry');

    const showMoreElement = document.createElement('div');
    showMoreElement.classList.add('show-more-element');

    const showMoreIcon = document.createElement('div');
    
    showMoreIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20%" height="20%" fill="white" class="bi bi-plus-lg" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
  </svg>`;

    showMoreIcon.classList.add('show-more-button');

    showMoreIcon.style.opacity = '0.7';

    showMoreElement.appendChild(showMoreIcon);

    backgroundDiv.append(showMoreElement);

    const containerElement = document.getElementById(container);
    containerElement?.appendChild(backgroundDiv);

    
    // Define the named function expression
    const clickHandler = () => {

        showMoreElement.removeEventListener('click', clickHandler);
        showMoreElement.innerHTML = '';
        showMoreElement.style.opacity = '0';

        backgroundDiv.style.cursor = 'default';


        console.log(showMoreElement.style.backgroundImage);

        //const currentEntries = result.media;
        currentPage++;
        const filters = getUrlParameter();

        //startLoadingAnimation();
        animeflix.search(query, filters).then((entries: any) => {
          //add the currententries to the new entries to entries.media
          //entries.media = currentEntries.concat(entries.media);

          //clearGrid();
          loadItems(entries, container);
          backgroundDiv.remove();


        });
    };
    

    showMoreElement.addEventListener('click', clickHandler);

    showMoreElement.addEventListener('mouseover', () => {
      showMoreIcon.style.opacity = '1';
    });

    showMoreElement.addEventListener('mouseout', () => {
      showMoreIcon.style.opacity = '0.7';
    });

  }
}

// export async function loadEntries(searchGrid: Element, entries: animeflix.AnimeQuery[]) {

//   for (let i = 0; i < entries.length; i++) {
//     if (searchGrid !== null) {

//       const mangaEntry: { 
//         id: number;
//         title: {
//           romaji: string;
//           english: string;
//           native: string;
//         };
//         description: string;
//         coverImage: {
//           extraLarge: string;
//           color: string;
//         }
//       } = entries[i];

//       const img = document.createElement('div');
//       img.setAttribute('class', 'grid-item'); // add the class attribute
      
//       // Create a new Image object
//       const actualImg = new Image();
      
//       // Set the source of the actual image to the mangaEntry cover image
//       actualImg.src = mangaEntry.coverImage.extraLarge;
      
//       // Add an event listener to handle the load event of the actual image
//       actualImg.addEventListener('load', () => {
//         // When the actual image has finished loading, update the background image of the div
//         img.style.backgroundImage = `url(${actualImg.src})`;
//         img.style.backgroundSize = '20vw 35vh';
//       });

//       // create a details section for the grid item and add it to the image
//       const details = document.createElement('div');
//       details.setAttribute('class', 'grid-item-details');
//       img.appendChild(details);

//       console.log(mangaEntry.title.romaji);

//       // add a title to the details section
//       addMetaInfo(details, mangaEntry.title.romaji);


//       img.addEventListener('click', function() {
//         console.log(mangaEntry.id);

//         const queryEntry: MangaEntry = {
//           manga: {
//             id: mangaEntry.id,
//             alt: mangaEntry.title.romaji,
//             img: mangaEntry.coverImage.extraLarge,
//           },
//         };

//         const state = <MangaDetails entry={queryEntry}/>;

//         State.updateState(state);
//       });
    
//       searchGrid.appendChild(img); // append the new element to searchGrid
//     }
//   }


// }

const InputTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'gray',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
});

const NsfwTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#510000',
    },
    '&:hover fieldset': {
      borderColor: 'red',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'red',
    },
  },
});

// Use the styled function to create a custom styled MenuItem component
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  backgroundColor: '#0F0000',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '0px',
  '&:hover': {
    backgroundColor: '#311A1E',
    color: 'white',
  },
  '&.Mui-selected': {
    backgroundColor: '#3F0D12',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: '#6F1016',
    },
  },
}));


const Season: string[] = [
  'Winter',
  'Spring',
  'Summer',
  'Fall',
  'Any'
];

const Format: string[] = [
  'TV',
  'Movie',
  'TV Short',
  'Special',
  'OVA',
  'ONA',
  'Any'
];

const AiringStatus: string[] = [
  'Finished',
  'Releasing',
  'Not yet released',
  'Cancelled',
  'Hiatus',
  'Any'
];

const Adult: string[] = [
  'NSFW',
  'SFW',
  'Any'
];

// enum Sort {
//   None = "None",
//   START_DATE = "Start Date",
//   START_DATE_DESC = "Start Date (Descending)",
//   END_DATE = "End Date",
//   END_DATE_DESC = "End Date (Descending)",
//   SCORE = "Score",
//   SCORE_DESC = "Score (Descending)",
//   POPULARITY = "Popularity",
//   POPULARITY_DESC = "Popularity (Descending)",
//   TRENDING = "Trending",
//   TRENDING_DESC = "Trending (Descending)",
//   EPISODES = "Episodes",
//   EPISODES_DESC = "Episodes (Descending)",
//   DURATION = "Duration",
//   DURATION_DESC = "Duration (Descending)",
//   STATUS = "Status",
//   STATUS_DESC = "Status (Descending)"
// }

const descending = "↑";
const ascending = "↓";

const Sort: { [key: string]: string } = {
  "None": "None",
  "START_DATE": ascending + " Start Date",
  "START_DATE_DESC": descending + " Start Date",
  "END_DATE": ascending + " End Date",
  "END_DATE_DESC": descending + " End Date",
  "SCORE": ascending + " Score",
  "SCORE_DESC": descending + " Score",
  "POPULARITY": ascending + " Popularity",
  "POPULARITY_DESC": descending + " Popularity",
  "TRENDING": ascending + " Trending",
  "TRENDING_DESC": descending + " Trending",
  "EPISODES": ascending + " Episodes",
  "EPISODES_DESC": descending + " Episodes",
  "DURATION": ascending + " Duration",
  "DURATION_DESC": descending + " Duration",
  "STATUS": ascending + " Status",
  "STATUS_DESC": descending + " Status"
};

const ElementsPerPage: string[] = [
  "10",
  "20",
  "30",
  "40",
  "50",
];


const fixedOptions: string[] = ["Anime"];
let value: string[] | undefined, setValue: (arg0: string[]) => void;


export default function SearchMenu() {  

  [value, setValue] = React.useState([...fixedOptions]);

  discord.setSearching();

  sideMenuUtils.toggle(document.getElementById('sidemenu-search')!);

  const items = document.querySelectorAll('.grid-item');
  items.forEach(item => {
    if (item.scrollHeight > item.clientHeight) {
      const overflowThreshold = item.clientHeight * 0.5; // set threshold to 50%
      item.addEventListener('scroll', () => {
        if (item.scrollTop > overflowThreshold) {
          item.classList.add('fading');
          item.classList.remove('visible');
        } else {
          item.classList.remove('fading');
          item.classList.add('visible');
        }
      });
    }
  });
  
  return (
    <>
      <div className='content-search'>
        <div className='search-results'>
          {/* <input type="text" id="search-input" name="search" placeholder="Search..." onKeyDown={search}></input> */}
            <InputTextField
              required
              id="search-input"
              label="Search"
              name="email"
              onKeyDown={search}
              InputProps={{
                style: { color: 'white' },
              }}
              InputLabelProps={{
                style: { color: 'gray' },
              }}
            />
          <InputTextField
            id="season-select"
            select
            label="Season"
            defaultValue={"Any"}
            InputProps={{
              style: { color: 'white' },
            }}
            InputLabelProps={{
              style: { color: 'gray' },
            }}
          >
          {Season.map((option) => (
            <StyledMenuItem key={option} value={option}>
              {option}
            </StyledMenuItem>
          ))}
          </InputTextField> 
          <InputTextField
            id="format-select"
            select
            label="Format"
            defaultValue={"Any"}
            InputProps={{
              style: { color: 'white' },
            }}
            InputLabelProps={{
              style: { color: 'gray' },
            }}
          >
          {Format.map((option) => (
            <StyledMenuItem key={option} value={option}>
              {option}
            </StyledMenuItem>
          ))}
          </InputTextField> 
          <InputTextField
            id="airing-status-select"
            select
            label="Airing Status"
            defaultValue={"Any"}
            InputProps={{
              style: { color: 'white' },
            }}
            InputLabelProps={{
              style: { color: 'gray' },
            }}
          >
          {AiringStatus.map((option) => (
            <StyledMenuItem key={option} value={option}>
              {option}
            </StyledMenuItem>
          ))}
          </InputTextField> 
          <InputTextField
            id="sorted-select"
            select
            onBlur={searchAnime}
            label="Sort"
            defaultValue={"None"}
            InputProps={{
              style: { color: 'white' },
            }}
            InputLabelProps={{
              style: { color: 'gray' },
            }}
          >
            {Object.keys(Sort).map((option) => (
              <StyledMenuItem key={option} value={option}>
                {Sort[option]}
              </StyledMenuItem>
            ))}
          </InputTextField>
          <InputTextField
            id="items-select"
            select
            label="Items per page"
            defaultValue={"10"}
            InputProps={{
              style: { color: 'white' },
            }}
            InputLabelProps={{
              style: { color: 'gray' },
            }}
          >
          {ElementsPerPage.map((option) => (
            <StyledMenuItem key={option} value={option}>
              {option}
            </StyledMenuItem>
          ))}
          </InputTextField> 
          <NsfwTextField
            id="nsfw-select"
            select
            label="Adult Content"
            defaultValue={"SFW"}
            color='warning'
            InputProps={{
              style: { color: 'red' },
            }}
            InputLabelProps={{
              style: { color: 'red' },
            }}
          >
          {Adult.map((option) => (
            <StyledMenuItem key={option} value={option}>
              {option}
            </StyledMenuItem>
          ))}
          </NsfwTextField> 
          <Autocomplete
            multiple
            id="fixed-tags"
            className='double-width'
            value={value}
            onChange={(_event, newValue) => {
              setValue([
                ...fixedOptions,
                ...newValue.filter((option) => fixedOptions.indexOf(option) === -1),
              ]);
            }}
            options={Tags}
            getOptionLabel={(option) => option}
            clearIcon={<ClearIcon style={{ fill: "white" }} />} // Add clear icon here
            disableClearable={true}
            disableCloseOnSelect={true}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  disabled={fixedOptions.indexOf(option) !== -1}
                  style={{
                    color: "white",
                    backgroundColor: "red", 
                  }}
                  deleteIcon={<ClearIcon style={{ fill: "white" }} />} // Change icon color here
                />
              ))
            }
            style={{ color: "white", borderColor: "red"}}
            renderInput={(params) => (
              <InputTextField
                {...params}
                label="Tags"
                placeholder="Favorites"
                InputLabelProps={{
                  style: { color: "white"}, // Change text color here
                }}
                style={{ color: "white", borderColor: "red"}}
              />
            )}
            PaperComponent={({ children }) => (
              <Paper style={{color: "white", backgroundColor: "#0F0000", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", fontSize: 18}}>{children}</Paper> // Change background color here
            )}
          />
        </div>
        <div className="search-grid" id='search-search-grid'></div>
      </div>
    </>
  );
}

const Tags = [
  "Anime",
  "4-koma",
  "Achromatic",
  "Achronological Order",
  "Acting",
  "Adoption",
  "Advertisement",
  "Afterlife",
  "Age Gap",
  "Age Regression",
  "Agender",
  "Agriculture",
  "Airsoft",
  "Alchemy",
  "Aliens",
  "Alternate Universe",
  "American Football",
  "Amnesia",
  "Anachronism",
  "Angels",
  "Animals",
  "Anthology",
  "Anthropomorphism",
  "Anti-Hero",
  "Archery",
  "Artificial Intelligence",
  "Asexual",
  "Assassins",
  "Astronomy",
  "Athletics",
  "Augmented Reality",
  "Autobiographical",
  "Aviation",
  "Badminton",
  "Band",
  "Bar",
  "Baseball",
  "Basketball",
  "Battle Royale",
  "Biographical",
  "Bisexual",
  "Body Horror",
  "Body Swapping",
  "Boxing",
  "Boys' Love",
  "Bullying",
  "Butler",
  "Calligraphy",
  "Cannibalism",
  "Card Battle",
  "Cars",
  "Centaur",
  "CGI",
  "Cheerleading",
  "Chibi",
  "Chimera",
  "Chuunibyou",
  "Circus",
  "Classic Literature",
  "Clone",
  "College",
  "Coming of Age",
  "Conspiracy",
  "Cosmic Horror",
  "Cosplay",
  "Crime",
  "Crossdressing",
  "Crossover",
  "Cult",
  "Cultivation",
  "Cute Boys Doing Cute Things",
  "Cute Girls Doing Cute Things",
  "Cyberpunk",
  "Cyborg",
  "Cycling",
  "Dancing",
  "Death Game",
  "Delinquents",
  "Demons",
  "Denpa",
  "Desert",
  "Detective",
  "Dinosaurs",
  "Disability",
  "Dissociative Identities",
  "Dragons",
  "Drawing",
  "Drugs",
  "Dullahan",
  "Dungeon",
  "Dystopian",
  "E-Sports",
  "Economics",
  "Educational",
  "Elf",
  "Ensemble Cast",
  "Environmental",
  "Episodic",
  "Ero Guro",
  "Espionage",
  "Fairy",
  "Fairy Tale",
  "Family Life",
  "Fashion",
  "Female Harem",
  "Female Protagonist",
  "Femboy",
  "Fencing",
  "Firefighters",
  "Fishing",
  "Fitness",
  "Flash",
  "Food",
  "Football",
  "Foreign",
  "Found Family",
  "Fugitive",
  "Full CGI",
  "Full Color",
  "Gambling",
  "Gangs",
  "Gender Bending",
  "Ghost",
  "Go",
  "Goblin",
  "Gods",
  "Golf",
  "Gore",
  "Guns",
  "Gyaru",
  "Handball",
  "Henshin",
  "Heterosexual",
  "Hikikomori",
  "Historical",
  "Homeless",
  "Ice Skating",
  "Idol",
  "Isekai",
  "Iyashikei",
  "Josei",
  "Judo",
  "Kaiju",
  "Karuta",
  "Kemonomimi",
  "Kids",
  "Kuudere",
  "Lacrosse",
  "Language Barrier",
  "LGBTQ+ Themes",
  "Lost Civilization",
  "Love Triangle",
  "Mafia",
  "Magic",
  "Mahjong",
  "Maids",
  "Makeup",
  "Male Harem",
  "Male Protagonist",
  "Marriage",
  "Martial Arts",
  "Medicine",
  "Memory Manipulation",
  "Mermaid",
  "Meta",
  "Military",
  "Mixed Gender Harem",
  "Monster Boy",
  "Monster Girl",
  "Mopeds",
  "Motorcycles",
  "Musical",
  "Mythology",
  "Necromancy",
  "Nekomimi",
  "Ninja",
  "No Dialogue",
  "Noir",
  "Non-fiction",
  "Nudity",
  "Nun",
  "Office Lady",
  "Oiran",
  "Ojou-sama",
  "Orphan",
  "Otaku Culture",
  "Outdoor",
  "Pandemic",
  "Parkour",
  "Parody",
  "Philosophy",
  "Photography",
  "Pirates",
  "Poker",
  "Police",
  "Politics",
  "Post-Apocalyptic",
  "POV",
  "Primarily Adult Cast",
  "Primarily Child Cast",
  "Primarily Female Cast",
  "Primarily Male Cast",
  "Primarily Teen Cast",
  "Prison",
  "Puppetry",
  "Rakugo",
  "Real Robot",
  "Rehabilitation",
  "Reincarnation",
  "Religion",
  "Revenge",
  "Robots",
  "Rotoscoping",
  "Rugby",
  "Rural",
  "Samurai",
  "Satire",
  "School",
  "School Club",
  "Scuba Diving",
  "Seinen",
  "Shapeshifting",
  "Ships",
  "Shogi",
  "Shoujo",
  "Shounen",
  "Shrine Maiden",
  "Skateboarding",
  "Skeleton",
  "Slapstick",
  "Slavery",
  "Software Development",
  "Space",
  "Space Opera",
  "Spearplay",
  "Steampunk",
  "Stop Motion",
  "Succubus",
  "Suicide",
  "Sumo",
  "Super Power",
  "Super Robot",
  "Superhero",
  "Surfing",
  "Surreal Comedy",
  "Survival",
  "Swimming",
  "Swordplay",
  "Table Tennis",
  "Tanks",
  "Tanned Skin",
  "Teacher",
  "Teens' Love",
  "Tennis",
  "Terrorism",
  "Time Manipulation",
  "Time Skip",
  "Tokusatsu",
  "Tomboy",
  "Torture",
  "Tragedy",
  "Trains",
  "Transgender",
  "Travel",
  "Triads",
  "Tsundere",
  "Twins",
  "Urban",
  "Urban Fantasy",
  "Vampire",
  "Video Games",
  "Vikings",
  "Villainess",
  "Virtual World",
  "Volleyball",
  "VTuber",
  "War",
  "Werewolf",
  "Witch",
  "Work",
  "Wrestling",
  "Writing",
  "Wuxia",
  "Yakuza",
  "Yandere",
  "Youkai",
  "Yuri",
  "Zombie"
];
