// Curated dataset for IMDB Map.
// ~220 films chosen to create dense overlap in casts (Nolan, Tarantino, Scorsese,
// Coens, Wes Anderson, Marvel, LOTR, Bond, A24, Apatow, Linklater, etc.).
// Each actor id is the kebab-case of their name. Cast is intentionally limited to
// the most central ~6-10 actors per film so the graph stays readable.

export type Movie = {
  id: string;
  title: string;
  year: number;
  cast: string[];
  hue?: number; // 0-360, used to color the poster card
};

const toId = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const m = (id: string, title: string, year: number, cast: string[], hue?: number): Movie => ({
  id,
  title,
  year,
  cast: cast.map(toId),
  hue,
});

export const MOVIES: Movie[] = [
  // --- Christopher Nolan ---
  m("memento", "Memento", 2000, ["Guy Pearce", "Carrie-Anne Moss", "Joe Pantoliano"], 215),
  m("batman-begins", "Batman Begins", 2005, ["Christian Bale", "Michael Caine", "Liam Neeson", "Katie Holmes", "Gary Oldman", "Cillian Murphy", "Morgan Freeman"], 220),
  m("the-prestige", "The Prestige", 2006, ["Christian Bale", "Hugh Jackman", "Michael Caine", "Scarlett Johansson", "David Bowie", "Rebecca Hall"], 30),
  m("the-dark-knight", "The Dark Knight", 2008, ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Maggie Gyllenhaal", "Gary Oldman", "Morgan Freeman"], 215),
  m("inception", "Inception", 2010, ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy", "Marion Cotillard", "Cillian Murphy", "Michael Caine", "Ken Watanabe"], 200),
  m("dark-knight-rises", "The Dark Knight Rises", 2012, ["Christian Bale", "Tom Hardy", "Anne Hathaway", "Michael Caine", "Gary Oldman", "Marion Cotillard", "Joseph Gordon-Levitt", "Morgan Freeman"], 210),
  m("interstellar", "Interstellar", 2014, ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine", "Casey Affleck", "Mackenzie Foy"], 195),
  m("dunkirk", "Dunkirk", 2017, ["Fionn Whitehead", "Tom Hardy", "Cillian Murphy", "Mark Rylance", "Kenneth Branagh", "Harry Styles"], 35),
  m("tenet", "Tenet", 2020, ["John David Washington", "Robert Pattinson", "Elizabeth Debicki", "Kenneth Branagh", "Michael Caine"], 205),
  m("oppenheimer", "Oppenheimer", 2023, ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh", "Rami Malek", "Kenneth Branagh", "Gary Oldman"], 25),

  // --- Quentin Tarantino ---
  m("reservoir-dogs", "Reservoir Dogs", 1992, ["Harvey Keitel", "Tim Roth", "Michael Madsen", "Steve Buscemi", "Quentin Tarantino"], 0),
  m("pulp-fiction", "Pulp Fiction", 1994, ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis", "Harvey Keitel", "Tim Roth", "Christopher Walken"], 10),
  m("jackie-brown", "Jackie Brown", 1997, ["Pam Grier", "Samuel L. Jackson", "Robert De Niro", "Bridget Fonda", "Robert Forster", "Michael Keaton"], 20),
  m("kill-bill-1", "Kill Bill: Vol. 1", 2003, ["Uma Thurman", "Lucy Liu", "Vivica A. Fox", "David Carradine", "Daryl Hannah", "Michael Madsen"], 50),
  m("kill-bill-2", "Kill Bill: Vol. 2", 2004, ["Uma Thurman", "David Carradine", "Michael Madsen", "Daryl Hannah", "Bo Svenson"], 55),
  m("inglourious-basterds", "Inglourious Basterds", 2009, ["Brad Pitt", "Christoph Waltz", "Michael Fassbender", "Diane Kruger", "Mélanie Laurent", "Eli Roth"], 15),
  m("django-unchained", "Django Unchained", 2012, ["Jamie Foxx", "Christoph Waltz", "Leonardo DiCaprio", "Samuel L. Jackson", "Kerry Washington", "Don Johnson"], 5),
  m("hateful-eight", "The Hateful Eight", 2015, ["Samuel L. Jackson", "Kurt Russell", "Jennifer Jason Leigh", "Walton Goggins", "Tim Roth", "Michael Madsen", "Bruce Dern"], 220),
  m("once-upon-time-hollywood", "Once Upon a Time in Hollywood", 2019, ["Leonardo DiCaprio", "Brad Pitt", "Margot Robbie", "Al Pacino", "Margaret Qualley", "Dakota Fanning", "Kurt Russell"], 25),

  // --- Martin Scorsese ---
  m("taxi-driver", "Taxi Driver", 1976, ["Robert De Niro", "Jodie Foster", "Harvey Keitel", "Cybill Shepherd", "Albert Brooks"], 30),
  m("raging-bull", "Raging Bull", 1980, ["Robert De Niro", "Joe Pesci", "Cathy Moriarty"], 220),
  m("goodfellas", "Goodfellas", 1990, ["Robert De Niro", "Ray Liotta", "Joe Pesci", "Lorraine Bracco", "Paul Sorvino"], 10),
  m("casino", "Casino", 1995, ["Robert De Niro", "Sharon Stone", "Joe Pesci", "James Woods"], 45),
  m("gangs-of-new-york", "Gangs of New York", 2002, ["Leonardo DiCaprio", "Daniel Day-Lewis", "Cameron Diaz", "Jim Broadbent", "Liam Neeson"], 5),
  m("aviator", "The Aviator", 2004, ["Leonardo DiCaprio", "Cate Blanchett", "Kate Beckinsale", "John C. Reilly", "Alec Baldwin"], 200),
  m("the-departed", "The Departed", 2006, ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson", "Mark Wahlberg", "Martin Sheen", "Vera Farmiga", "Alec Baldwin"], 0),
  m("shutter-island", "Shutter Island", 2010, ["Leonardo DiCaprio", "Mark Ruffalo", "Ben Kingsley", "Michelle Williams", "Emily Mortimer"], 210),
  m("hugo", "Hugo", 2011, ["Asa Butterfield", "Chloë Grace Moretz", "Ben Kingsley", "Sacha Baron Cohen", "Jude Law"], 35),
  m("wolf-of-wall-street", "The Wolf of Wall Street", 2013, ["Leonardo DiCaprio", "Jonah Hill", "Margot Robbie", "Matthew McConaughey", "Kyle Chandler", "Rob Reiner"], 50),
  m("silence", "Silence", 2016, ["Andrew Garfield", "Adam Driver", "Liam Neeson"], 30),
  m("the-irishman", "The Irishman", 2019, ["Robert De Niro", "Al Pacino", "Joe Pesci", "Ray Romano", "Bobby Cannavale", "Anna Paquin"], 25),
  m("killers-of-the-flower-moon", "Killers of the Flower Moon", 2023, ["Leonardo DiCaprio", "Robert De Niro", "Lily Gladstone", "Jesse Plemons", "Brendan Fraser"], 15),

  // --- Coen Brothers ---
  m("fargo", "Fargo", 1996, ["Frances McDormand", "William H. Macy", "Steve Buscemi", "Peter Stormare"], 200),
  m("big-lebowski", "The Big Lebowski", 1998, ["Jeff Bridges", "John Goodman", "Julianne Moore", "Steve Buscemi", "Philip Seymour Hoffman", "Sam Elliott"], 45),
  m("o-brother", "O Brother, Where Art Thou?", 2000, ["George Clooney", "John Turturro", "Tim Blake Nelson", "John Goodman", "Holly Hunter"], 35),
  m("no-country", "No Country for Old Men", 2007, ["Tommy Lee Jones", "Javier Bardem", "Josh Brolin", "Woody Harrelson"], 30),
  m("burn-after-reading", "Burn After Reading", 2008, ["George Clooney", "Brad Pitt", "Frances McDormand", "John Malkovich", "Tilda Swinton"], 50),
  m("a-serious-man", "A Serious Man", 2009, ["Michael Stuhlbarg", "Richard Kind", "Fred Melamed"], 40),
  m("true-grit", "True Grit", 2010, ["Jeff Bridges", "Hailee Steinfeld", "Matt Damon", "Josh Brolin"], 30),
  m("inside-llewyn-davis", "Inside Llewyn Davis", 2013, ["Oscar Isaac", "Carey Mulligan", "Justin Timberlake", "John Goodman", "Adam Driver"], 200),

  // --- Wes Anderson ---
  m("rushmore", "Rushmore", 1998, ["Jason Schwartzman", "Bill Murray", "Olivia Williams"], 45),
  m("royal-tenenbaums", "The Royal Tenenbaums", 2001, ["Gene Hackman", "Anjelica Huston", "Ben Stiller", "Gwyneth Paltrow", "Luke Wilson", "Owen Wilson", "Bill Murray", "Danny Glover"], 35),
  m("life-aquatic", "The Life Aquatic with Steve Zissou", 2004, ["Bill Murray", "Owen Wilson", "Cate Blanchett", "Anjelica Huston", "Willem Dafoe", "Jeff Goldblum"], 200),
  m("darjeeling-limited", "The Darjeeling Limited", 2007, ["Owen Wilson", "Adrien Brody", "Jason Schwartzman", "Bill Murray", "Anjelica Huston"], 25),
  m("moonrise-kingdom", "Moonrise Kingdom", 2012, ["Bruce Willis", "Edward Norton", "Bill Murray", "Frances McDormand", "Tilda Swinton", "Jason Schwartzman"], 50),
  m("grand-budapest", "The Grand Budapest Hotel", 2014, ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan", "Adrien Brody", "Willem Dafoe", "Jeff Goldblum", "Edward Norton", "Tilda Swinton", "Jason Schwartzman", "Bill Murray"], 320),
  m("french-dispatch", "The French Dispatch", 2021, ["Benicio del Toro", "Frances McDormand", "Timothée Chalamet", "Bill Murray", "Owen Wilson", "Tilda Swinton", "Adrien Brody", "Jeffrey Wright"], 30),
  m("asteroid-city", "Asteroid City", 2023, ["Jason Schwartzman", "Scarlett Johansson", "Tom Hanks", "Jeffrey Wright", "Tilda Swinton", "Bryan Cranston", "Edward Norton", "Adrien Brody"], 20),

  // --- David Fincher ---
  m("seven", "Se7en", 1995, ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow", "Kevin Spacey"], 210),
  m("fight-club", "Fight Club", 1999, ["Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"], 0),
  m("zodiac", "Zodiac", 2007, ["Jake Gyllenhaal", "Robert Downey Jr.", "Mark Ruffalo", "Anthony Edwards", "Brian Cox"], 200),
  m("benjamin-button", "The Curious Case of Benjamin Button", 2008, ["Brad Pitt", "Cate Blanchett", "Tilda Swinton", "Taraji P. Henson"], 40),
  m("social-network", "The Social Network", 2010, ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake", "Armie Hammer", "Rooney Mara"], 200),
  m("dragon-tattoo", "The Girl with the Dragon Tattoo", 2011, ["Daniel Craig", "Rooney Mara", "Christopher Plummer", "Stellan Skarsgård"], 220),
  m("gone-girl", "Gone Girl", 2014, ["Ben Affleck", "Rosamund Pike", "Neil Patrick Harris", "Tyler Perry"], 30),

  // --- Steven Spielberg ---
  m("jaws", "Jaws", 1975, ["Roy Scheider", "Robert Shaw", "Richard Dreyfuss"], 200),
  m("raiders", "Raiders of the Lost Ark", 1981, ["Harrison Ford", "Karen Allen", "Paul Freeman"], 30),
  m("et", "E.T. the Extra-Terrestrial", 1982, ["Henry Thomas", "Drew Barrymore", "Peter Coyote"], 200),
  m("jurassic-park", "Jurassic Park", 1993, ["Sam Neill", "Laura Dern", "Jeff Goldblum", "Richard Attenborough", "Samuel L. Jackson"], 90),
  m("schindlers-list", "Schindler's List", 1993, ["Liam Neeson", "Ralph Fiennes", "Ben Kingsley"], 0),
  m("saving-private-ryan", "Saving Private Ryan", 1998, ["Tom Hanks", "Matt Damon", "Tom Sizemore", "Edward Burns", "Vin Diesel", "Paul Giamatti", "Bryan Cranston"], 40),
  m("catch-me", "Catch Me If You Can", 2002, ["Leonardo DiCaprio", "Tom Hanks", "Christopher Walken", "Martin Sheen", "Amy Adams"], 50),
  m("munich", "Munich", 2005, ["Eric Bana", "Daniel Craig", "Ciarán Hinds", "Mathieu Kassovitz", "Geoffrey Rush"], 25),
  m("lincoln", "Lincoln", 2012, ["Daniel Day-Lewis", "Sally Field", "David Strathairn", "Tommy Lee Jones", "Joseph Gordon-Levitt"], 20),
  m("bridge-of-spies", "Bridge of Spies", 2015, ["Tom Hanks", "Mark Rylance", "Alan Alda", "Amy Ryan"], 40),
  m("the-post", "The Post", 2017, ["Meryl Streep", "Tom Hanks", "Sarah Paulson", "Bob Odenkirk"], 25),
  m("west-side-story", "West Side Story", 2021, ["Ansel Elgort", "Rachel Zegler", "Ariana DeBose", "Mike Faist", "Rita Moreno"], 0),
  m("the-fabelmans", "The Fabelmans", 2022, ["Michelle Williams", "Paul Dano", "Seth Rogen", "Gabriel LaBelle"], 35),

  // --- Marvel Cinematic Universe (high overlap) ---
  m("iron-man", "Iron Man", 2008, ["Robert Downey Jr.", "Gwyneth Paltrow", "Jeff Bridges", "Terrence Howard"], 0),
  m("iron-man-2", "Iron Man 2", 2010, ["Robert Downey Jr.", "Gwyneth Paltrow", "Don Cheadle", "Scarlett Johansson", "Mickey Rourke", "Sam Rockwell", "Samuel L. Jackson"], 350),
  m("thor", "Thor", 2011, ["Chris Hemsworth", "Natalie Portman", "Tom Hiddleston", "Anthony Hopkins", "Idris Elba", "Stellan Skarsgård"], 220),
  m("captain-america-first", "Captain America: The First Avenger", 2011, ["Chris Evans", "Hayley Atwell", "Sebastian Stan", "Tommy Lee Jones", "Hugo Weaving", "Stanley Tucci", "Samuel L. Jackson"], 0),
  m("avengers", "The Avengers", 2012, ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Mark Ruffalo", "Scarlett Johansson", "Jeremy Renner", "Tom Hiddleston", "Samuel L. Jackson"], 220),
  m("winter-soldier", "Captain America: The Winter Soldier", 2014, ["Chris Evans", "Scarlett Johansson", "Sebastian Stan", "Anthony Mackie", "Robert Redford", "Samuel L. Jackson"], 210),
  m("guardians", "Guardians of the Galaxy", 2014, ["Chris Pratt", "Zoe Saldaña", "Dave Bautista", "Bradley Cooper", "Vin Diesel", "Lee Pace", "Karen Gillan"], 280),
  m("doctor-strange", "Doctor Strange", 2016, ["Benedict Cumberbatch", "Tilda Swinton", "Chiwetel Ejiofor", "Rachel McAdams", "Mads Mikkelsen", "Benedict Wong"], 290),
  m("civil-war", "Captain America: Civil War", 2016, ["Chris Evans", "Robert Downey Jr.", "Sebastian Stan", "Scarlett Johansson", "Anthony Mackie", "Chadwick Boseman", "Tom Holland", "Paul Rudd"], 220),
  m("black-panther", "Black Panther", 2018, ["Chadwick Boseman", "Michael B. Jordan", "Lupita Nyong'o", "Danai Gurira", "Letitia Wright", "Daniel Kaluuya", "Forest Whitaker", "Andy Serkis"], 280),
  m("infinity-war", "Avengers: Infinity War", 2018, ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Scarlett Johansson", "Benedict Cumberbatch", "Tom Holland", "Chadwick Boseman", "Chris Pratt", "Josh Brolin", "Zoe Saldaña"], 270),
  m("endgame", "Avengers: Endgame", 2019, ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Mark Ruffalo", "Scarlett Johansson", "Jeremy Renner", "Karen Gillan", "Paul Rudd", "Brie Larson", "Josh Brolin"], 230),
  m("spider-man-far-from-home", "Spider-Man: Far From Home", 2019, ["Tom Holland", "Jake Gyllenhaal", "Samuel L. Jackson", "Zendaya", "Marisa Tomei", "Jacob Batalon"], 200),
  m("eternals", "Eternals", 2021, ["Gemma Chan", "Richard Madden", "Salma Hayek", "Angelina Jolie", "Kit Harington", "Kumail Nanjiani", "Barry Keoghan"], 25),
  m("spider-man-no-way-home", "Spider-Man: No Way Home", 2021, ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Tobey Maguire", "Andrew Garfield", "Alfred Molina", "Willem Dafoe", "Jamie Foxx"], 220),

  // --- DC ---
  m("man-of-steel", "Man of Steel", 2013, ["Henry Cavill", "Amy Adams", "Michael Shannon", "Russell Crowe", "Kevin Costner", "Diane Lane"], 220),
  m("bvs", "Batman v Superman: Dawn of Justice", 2016, ["Ben Affleck", "Henry Cavill", "Amy Adams", "Jesse Eisenberg", "Gal Gadot", "Jeremy Irons"], 220),
  m("joker", "Joker", 2019, ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy", "Brett Cullen"], 30),
  m("the-batman", "The Batman", 2022, ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Jeffrey Wright", "Colin Farrell", "John Turturro", "Andy Serkis"], 240),

  // --- LOTR / Hobbit / Peter Jackson ---
  m("fellowship", "The Lord of the Rings: The Fellowship of the Ring", 2001, ["Elijah Wood", "Ian McKellen", "Viggo Mortensen", "Sean Astin", "Orlando Bloom", "Cate Blanchett", "Liv Tyler", "Hugo Weaving", "Christopher Lee"], 110),
  m("two-towers", "The Lord of the Rings: The Two Towers", 2002, ["Elijah Wood", "Ian McKellen", "Viggo Mortensen", "Sean Astin", "Orlando Bloom", "Andy Serkis", "Bernard Hill", "Karl Urban"], 110),
  m("return-king", "The Lord of the Rings: The Return of the King", 2003, ["Elijah Wood", "Ian McKellen", "Viggo Mortensen", "Sean Astin", "Orlando Bloom", "Andy Serkis", "John Noble"], 110),
  m("hobbit-unexpected", "The Hobbit: An Unexpected Journey", 2012, ["Martin Freeman", "Ian McKellen", "Richard Armitage", "Andy Serkis", "Cate Blanchett", "Hugo Weaving", "Christopher Lee", "Benedict Cumberbatch"], 100),
  m("hobbit-desolation", "The Hobbit: The Desolation of Smaug", 2013, ["Martin Freeman", "Ian McKellen", "Richard Armitage", "Benedict Cumberbatch", "Evangeline Lilly", "Orlando Bloom", "Luke Evans"], 105),

  // --- Star Wars (Disney era + originals) ---
  m("force-awakens", "Star Wars: The Force Awakens", 2015, ["Daisy Ridley", "John Boyega", "Adam Driver", "Harrison Ford", "Mark Hamill", "Carrie Fisher", "Oscar Isaac", "Lupita Nyong'o"], 220),
  m("last-jedi", "Star Wars: The Last Jedi", 2017, ["Daisy Ridley", "Adam Driver", "Mark Hamill", "Carrie Fisher", "John Boyega", "Oscar Isaac", "Laura Dern", "Benicio del Toro"], 240),
  m("rogue-one", "Rogue One: A Star Wars Story", 2016, ["Felicity Jones", "Diego Luna", "Mads Mikkelsen", "Ben Mendelsohn", "Forest Whitaker", "Donnie Yen"], 30),
  m("solo", "Solo: A Star Wars Story", 2018, ["Alden Ehrenreich", "Woody Harrelson", "Emilia Clarke", "Donald Glover", "Thandiwe Newton", "Paul Bettany"], 30),

  // --- Harry Potter ---
  m("hp-sorcerers-stone", "Harry Potter and the Sorcerer's Stone", 2001, ["Daniel Radcliffe", "Rupert Grint", "Emma Watson", "Alan Rickman", "Maggie Smith", "Richard Harris", "Robbie Coltrane"], 30),
  m("hp-prisoner-azkaban", "Harry Potter and the Prisoner of Azkaban", 2004, ["Daniel Radcliffe", "Rupert Grint", "Emma Watson", "Gary Oldman", "Alan Rickman", "Michael Gambon", "David Thewlis", "Timothy Spall"], 200),
  m("hp-deathly-hallows-2", "Harry Potter and the Deathly Hallows: Part 2", 2011, ["Daniel Radcliffe", "Rupert Grint", "Emma Watson", "Ralph Fiennes", "Alan Rickman", "Helena Bonham Carter", "Michael Gambon"], 220),
  m("fantastic-beasts", "Fantastic Beasts and Where to Find Them", 2016, ["Eddie Redmayne", "Katherine Waterston", "Dan Fogler", "Colin Farrell", "Ezra Miller", "Jon Voight"], 35),

  // --- James Bond (Craig era + earlier) ---
  m("goldeneye", "GoldenEye", 1995, ["Pierce Brosnan", "Sean Bean", "Izabella Scorupco", "Famke Janssen", "Judi Dench"], 200),
  m("casino-royale", "Casino Royale", 2006, ["Daniel Craig", "Eva Green", "Mads Mikkelsen", "Judi Dench", "Jeffrey Wright"], 215),
  m("skyfall", "Skyfall", 2012, ["Daniel Craig", "Judi Dench", "Javier Bardem", "Ralph Fiennes", "Naomie Harris", "Ben Whishaw"], 0),
  m("spectre", "Spectre", 2015, ["Daniel Craig", "Christoph Waltz", "Léa Seydoux", "Ben Whishaw", "Naomie Harris", "Ralph Fiennes", "Monica Bellucci"], 220),
  m("no-time-to-die", "No Time to Die", 2021, ["Daniel Craig", "Rami Malek", "Léa Seydoux", "Ana de Armas", "Lashana Lynch", "Ralph Fiennes", "Ben Whishaw"], 5),

  // --- A24 / indie prestige ---
  m("ex-machina", "Ex Machina", 2014, ["Alicia Vikander", "Domhnall Gleeson", "Oscar Isaac"], 195),
  m("room", "Room", 2015, ["Brie Larson", "Jacob Tremblay", "Joan Allen", "William H. Macy"], 35),
  m("the-witch", "The Witch", 2015, ["Anya Taylor-Joy", "Ralph Ineson", "Kate Dickie"], 250),
  m("moonlight", "Moonlight", 2016, ["Mahershala Ali", "Naomie Harris", "André Holland", "Janelle Monáe", "Trevante Rhodes"], 230),
  m("lady-bird", "Lady Bird", 2017, ["Saoirse Ronan", "Laurie Metcalf", "Timothée Chalamet", "Lucas Hedges", "Tracy Letts"], 340),
  m("call-me-by-your-name", "Call Me by Your Name", 2017, ["Timothée Chalamet", "Armie Hammer", "Michael Stuhlbarg", "Esther Garrel"], 35),
  m("hereditary", "Hereditary", 2018, ["Toni Collette", "Alex Wolff", "Milly Shapiro", "Gabriel Byrne", "Ann Dowd"], 0),
  m("midsommar", "Midsommar", 2019, ["Florence Pugh", "Jack Reynor", "Will Poulter", "William Jackson Harper"], 60),
  m("uncut-gems", "Uncut Gems", 2019, ["Adam Sandler", "Lakeith Stanfield", "Julia Fox", "Idina Menzel", "Eric Bogosian"], 200),
  m("minari", "Minari", 2020, ["Steven Yeun", "Han Ye-ri", "Alan Kim", "Youn Yuh-jung", "Will Patton"], 70),
  m("green-knight", "The Green Knight", 2021, ["Dev Patel", "Alicia Vikander", "Joel Edgerton", "Sarita Choudhury", "Sean Harris"], 130),
  m("everything-everywhere", "Everything Everywhere All at Once", 2022, ["Michelle Yeoh", "Ke Huy Quan", "Stephanie Hsu", "Jamie Lee Curtis", "James Hong"], 290),
  m("the-whale", "The Whale", 2022, ["Brendan Fraser", "Sadie Sink", "Hong Chau", "Ty Simpkins"], 200),
  m("aftersun", "Aftersun", 2022, ["Paul Mescal", "Frankie Corio", "Celia Rowlson-Hall"], 30),
  m("the-zone-of-interest", "The Zone of Interest", 2023, ["Christian Friedel", "Sandra Hüller"], 50),
  m("past-lives", "Past Lives", 2023, ["Greta Lee", "Teo Yoo", "John Magaro"], 200),
  m("the-iron-claw", "The Iron Claw", 2023, ["Zac Efron", "Jeremy Allen White", "Harris Dickinson", "Maura Tierney", "Lily James", "Holt McCallany"], 25),

  // --- Paul Thomas Anderson ---
  m("boogie-nights", "Boogie Nights", 1997, ["Mark Wahlberg", "Julianne Moore", "Burt Reynolds", "John C. Reilly", "Philip Seymour Hoffman", "Don Cheadle"], 0),
  m("magnolia", "Magnolia", 1999, ["Tom Cruise", "Julianne Moore", "Philip Seymour Hoffman", "John C. Reilly", "William H. Macy", "Jason Robards"], 200),
  m("there-will-be-blood", "There Will Be Blood", 2007, ["Daniel Day-Lewis", "Paul Dano", "Ciarán Hinds"], 30),
  m("the-master", "The Master", 2012, ["Joaquin Phoenix", "Philip Seymour Hoffman", "Amy Adams"], 200),
  m("phantom-thread", "Phantom Thread", 2017, ["Daniel Day-Lewis", "Vicky Krieps", "Lesley Manville"], 350),
  m("licorice-pizza", "Licorice Pizza", 2021, ["Alana Haim", "Cooper Hoffman", "Sean Penn", "Bradley Cooper", "Tom Waits"], 20),

  // --- Sci-fi blockbusters & misc 2010s ---
  m("matrix", "The Matrix", 1999, ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"], 130),
  m("matrix-reloaded", "The Matrix Reloaded", 2003, ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving", "Monica Bellucci"], 140),
  m("john-wick", "John Wick", 2014, ["Keanu Reeves", "Michael Nyqvist", "Alfie Allen", "Willem Dafoe", "Ian McShane"], 0),
  m("john-wick-3", "John Wick: Chapter 3 – Parabellum", 2019, ["Keanu Reeves", "Halle Berry", "Ian McShane", "Laurence Fishburne", "Mark Dacascos"], 350),
  m("mad-max-fury-road", "Mad Max: Fury Road", 2015, ["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Hugh Keays-Byrne", "Zoë Kravitz", "Rosie Huntington-Whiteley"], 25),
  m("blade-runner-2049", "Blade Runner 2049", 2017, ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Jared Leto", "Robin Wright", "Dave Bautista"], 215),
  m("arrival", "Arrival", 2016, ["Amy Adams", "Jeremy Renner", "Forest Whitaker"], 200),
  m("the-revenant", "The Revenant", 2015, ["Leonardo DiCaprio", "Tom Hardy", "Domhnall Gleeson", "Will Poulter"], 30),
  m("birdman", "Birdman", 2014, ["Michael Keaton", "Edward Norton", "Emma Stone", "Naomi Watts", "Zach Galifianakis", "Andrea Riseborough"], 25),
  m("la-la-land", "La La Land", 2016, ["Ryan Gosling", "Emma Stone", "John Legend", "J.K. Simmons", "Rosemarie DeWitt"], 50),
  m("dune", "Dune", 2021, ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin", "Zendaya", "Jason Momoa", "Stellan Skarsgård", "Javier Bardem", "Dave Bautista"], 30),
  m("dune-two", "Dune: Part Two", 2024, ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin", "Austin Butler", "Florence Pugh", "Christopher Walken", "Stellan Skarsgård", "Javier Bardem"], 25),
  m("barbie", "Barbie", 2023, ["Margot Robbie", "Ryan Gosling", "America Ferrera", "Kate McKinnon", "Will Ferrell", "Issa Rae"], 320),
  m("poor-things", "Poor Things", 2023, ["Emma Stone", "Mark Ruffalo", "Willem Dafoe", "Ramy Youssef", "Christopher Abbott"], 290),
  m("the-favourite", "The Favourite", 2018, ["Olivia Colman", "Emma Stone", "Rachel Weisz", "Nicholas Hoult"], 20),
  m("knives-out", "Knives Out", 2019, ["Daniel Craig", "Chris Evans", "Ana de Armas", "Jamie Lee Curtis", "Don Johnson", "Michael Shannon", "Toni Collette", "Christopher Plummer"], 30),
  m("glass-onion", "Glass Onion: A Knives Out Mystery", 2022, ["Daniel Craig", "Edward Norton", "Janelle Monáe", "Kate Hudson", "Dave Bautista", "Kathryn Hahn", "Leslie Odom Jr."], 200),

  // --- Apatow / modern comedy ---
  m("anchorman", "Anchorman: The Legend of Ron Burgundy", 2004, ["Will Ferrell", "Christina Applegate", "Steve Carell", "Paul Rudd", "David Koechner"], 35),
  m("40-year-old-virgin", "The 40-Year-Old Virgin", 2005, ["Steve Carell", "Catherine Keener", "Paul Rudd", "Romany Malco", "Seth Rogen", "Elizabeth Banks"], 25),
  m("knocked-up", "Knocked Up", 2007, ["Seth Rogen", "Katherine Heigl", "Paul Rudd", "Leslie Mann", "Jay Baruchel"], 30),
  m("superbad", "Superbad", 2007, ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse", "Bill Hader", "Seth Rogen", "Emma Stone"], 40),
  m("step-brothers", "Step Brothers", 2008, ["Will Ferrell", "John C. Reilly", "Mary Steenburgen", "Richard Jenkins"], 20),
  m("bridesmaids", "Bridesmaids", 2011, ["Kristen Wiig", "Maya Rudolph", "Rose Byrne", "Melissa McCarthy", "Chris O'Dowd", "Jon Hamm"], 320),
  m("21-jump-street", "21 Jump Street", 2012, ["Jonah Hill", "Channing Tatum", "Ice Cube", "Brie Larson", "Dave Franco"], 200),

  // --- Linklater / Before trilogy ---
  m("dazed-and-confused", "Dazed and Confused", 1993, ["Jason London", "Matthew McConaughey", "Ben Affleck", "Parker Posey", "Milla Jovovich"], 30),
  m("before-sunrise", "Before Sunrise", 1995, ["Ethan Hawke", "Julie Delpy"], 30),
  m("before-sunset", "Before Sunset", 2004, ["Ethan Hawke", "Julie Delpy"], 35),
  m("school-of-rock", "School of Rock", 2003, ["Jack Black", "Joan Cusack", "Mike White"], 25),
  m("boyhood", "Boyhood", 2014, ["Ellar Coltrane", "Patricia Arquette", "Ethan Hawke", "Lorelei Linklater"], 30),

  // --- Aronofsky & misc auteurs ---
  m("requiem", "Requiem for a Dream", 2000, ["Ellen Burstyn", "Jared Leto", "Jennifer Connelly", "Marlon Wayans"], 200),
  m("the-wrestler", "The Wrestler", 2008, ["Mickey Rourke", "Marisa Tomei", "Evan Rachel Wood"], 20),
  m("black-swan", "Black Swan", 2010, ["Natalie Portman", "Mila Kunis", "Vincent Cassel", "Barbara Hershey", "Winona Ryder"], 320),
  m("noah", "Noah", 2014, ["Russell Crowe", "Jennifer Connelly", "Ray Winstone", "Emma Watson", "Anthony Hopkins", "Logan Lerman"], 210),

  // --- Action / franchise staples ---
  m("heat", "Heat", 1995, ["Al Pacino", "Robert De Niro", "Val Kilmer", "Jon Voight", "Tom Sizemore", "Ashley Judd", "Natalie Portman"], 220),
  m("the-rock", "The Rock", 1996, ["Sean Connery", "Nicolas Cage", "Ed Harris", "Michael Biehn"], 30),
  m("face-off", "Face/Off", 1997, ["John Travolta", "Nicolas Cage", "Joan Allen", "Alessandro Nivola", "Gina Gershon"], 0),
  m("mission-impossible", "Mission: Impossible", 1996, ["Tom Cruise", "Jon Voight", "Emmanuelle Béart", "Henry Czerny", "Ving Rhames"], 220),
  m("mi-fallout", "Mission: Impossible - Fallout", 2018, ["Tom Cruise", "Henry Cavill", "Rebecca Ferguson", "Ving Rhames", "Simon Pegg", "Vanessa Kirby", "Alec Baldwin"], 0),
  m("fast-five", "Fast Five", 2011, ["Vin Diesel", "Paul Walker", "Dwayne Johnson", "Jordana Brewster", "Tyrese Gibson", "Ludacris"], 50),
  m("oceans-eleven", "Ocean's Eleven", 2001, ["George Clooney", "Brad Pitt", "Matt Damon", "Julia Roberts", "Andy García", "Don Cheadle", "Bernie Mac", "Casey Affleck", "Elliott Gould"], 200),
  m("oceans-twelve", "Ocean's Twelve", 2004, ["George Clooney", "Brad Pitt", "Matt Damon", "Catherine Zeta-Jones", "Julia Roberts", "Vincent Cassel", "Don Cheadle"], 210),
  m("oceans-thirteen", "Ocean's Thirteen", 2007, ["George Clooney", "Brad Pitt", "Matt Damon", "Al Pacino", "Ellen Barkin", "Don Cheadle", "Andy García"], 220),

  // --- Pixar / Animation (voice cast still counts!) ---
  m("toy-story", "Toy Story", 1995, ["Tom Hanks", "Tim Allen", "Don Rickles", "Wallace Shawn", "John Ratzenberger"], 40),
  m("toy-story-3", "Toy Story 3", 2010, ["Tom Hanks", "Tim Allen", "Joan Cusack", "Ned Beatty", "Michael Keaton"], 45),
  m("finding-nemo", "Finding Nemo", 2003, ["Albert Brooks", "Ellen DeGeneres", "Alexander Gould", "Willem Dafoe"], 200),
  m("the-incredibles", "The Incredibles", 2004, ["Craig T. Nelson", "Holly Hunter", "Samuel L. Jackson", "Jason Lee", "Sarah Vowell"], 0),
  m("ratatouille", "Ratatouille", 2007, ["Patton Oswalt", "Lou Romano", "Brad Garrett", "Janeane Garofalo", "Peter O'Toole"], 30),
  m("wall-e", "WALL-E", 2008, ["Ben Burtt", "Elissa Knight", "Jeff Garlin", "Fred Willard", "Sigourney Weaver"], 45),
  m("up", "Up", 2009, ["Ed Asner", "Christopher Plummer", "Jordan Nagai", "Bob Peterson"], 200),
  m("inside-out", "Inside Out", 2015, ["Amy Poehler", "Phyllis Smith", "Bill Hader", "Lewis Black", "Mindy Kaling", "Diane Lane"], 50),
  m("coco", "Coco", 2017, ["Anthony Gonzalez", "Gael García Bernal", "Benjamin Bratt", "Edward James Olmos"], 25),
  m("soul", "Soul", 2020, ["Jamie Foxx", "Tina Fey", "Phylicia Rashad", "Daveed Diggs", "Questlove"], 220),

  // --- 90s / 2000s classics ---
  m("forrest-gump", "Forrest Gump", 1994, ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field", "Mykelti Williamson"], 50),
  m("titanic", "Titanic", 1997, ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane", "Kathy Bates", "Frances Fisher"], 200),
  m("good-will-hunting", "Good Will Hunting", 1997, ["Matt Damon", "Robin Williams", "Ben Affleck", "Minnie Driver", "Stellan Skarsgård"], 30),
  m("the-truman-show", "The Truman Show", 1998, ["Jim Carrey", "Laura Linney", "Ed Harris", "Noah Emmerich", "Natascha McElhone"], 200),
  m("american-beauty", "American Beauty", 1999, ["Kevin Spacey", "Annette Bening", "Thora Birch", "Wes Bentley", "Mena Suvari", "Chris Cooper"], 350),
  m("a-beautiful-mind", "A Beautiful Mind", 2001, ["Russell Crowe", "Ed Harris", "Jennifer Connelly", "Paul Bettany", "Christopher Plummer"], 40),
  m("almost-famous", "Almost Famous", 2000, ["Billy Crudup", "Patrick Fugit", "Kate Hudson", "Frances McDormand", "Jason Lee", "Philip Seymour Hoffman", "Zooey Deschanel"], 35),

  // --- Romance / drama ---
  m("eternal-sunshine", "Eternal Sunshine of the Spotless Mind", 2004, ["Jim Carrey", "Kate Winslet", "Kirsten Dunst", "Mark Ruffalo", "Elijah Wood", "Tom Wilkinson"], 200),
  m("500-days-summer", "(500) Days of Summer", 2009, ["Joseph Gordon-Levitt", "Zooey Deschanel", "Geoffrey Arend", "Chloë Grace Moretz"], 30),
  m("her", "Her", 2013, ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams", "Rooney Mara", "Olivia Wilde"], 0),
  m("blue-valentine", "Blue Valentine", 2010, ["Ryan Gosling", "Michelle Williams", "John Doman"], 215),

  // --- Horror / thriller ---
  m("silence-of-lambs", "The Silence of the Lambs", 1991, ["Jodie Foster", "Anthony Hopkins", "Scott Glenn", "Ted Levine"], 90),
  m("get-out", "Get Out", 2017, ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford", "Catherine Keener", "LaKeith Stanfield"], 0),
  m("us", "Us", 2019, ["Lupita Nyong'o", "Winston Duke", "Elisabeth Moss", "Tim Heidecker"], 0),
  m("nope", "Nope", 2022, ["Daniel Kaluuya", "Keke Palmer", "Steven Yeun", "Brandon Perea"], 220),
  m("a-quiet-place", "A Quiet Place", 2018, ["Emily Blunt", "John Krasinski", "Millicent Simmonds", "Noah Jupe"], 40),
  m("parasite", "Parasite", 2019, ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik", "Park So-dam"], 220),

  // --- Recent prestige / 2022-2024 ---
  m("top-gun-maverick", "Top Gun: Maverick", 2022, ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm", "Val Kilmer", "Glen Powell"], 215),
  m("tar", "Tár", 2022, ["Cate Blanchett", "Nina Hoss", "Noémie Merlant", "Mark Strong"], 200),
  m("women-talking", "Women Talking", 2022, ["Rooney Mara", "Claire Foy", "Jessie Buckley", "Ben Whishaw", "Frances McDormand"], 30),
  m("the-banshees-of-inisherin", "The Banshees of Inisherin", 2022, ["Colin Farrell", "Brendan Gleeson", "Kerry Condon", "Barry Keoghan"], 130),
  m("anatomy-of-a-fall", "Anatomy of a Fall", 2023, ["Sandra Hüller", "Swann Arlaud", "Milo Machado-Graner"], 220),
  m("american-fiction", "American Fiction", 2023, ["Jeffrey Wright", "Tracee Ellis Ross", "John Ortiz", "Erika Alexander", "Sterling K. Brown"], 25),
  m("anora", "Anora", 2024, ["Mikey Madison", "Mark Eydelshteyn", "Karren Karagulian", "Yura Borisov"], 320),
  m("challengers", "Challengers", 2024, ["Zendaya", "Josh O'Connor", "Mike Faist"], 40),
  m("conclave", "Conclave", 2024, ["Ralph Fiennes", "Stanley Tucci", "John Lithgow", "Isabella Rossellini"], 0),

  // --- Wahlberg / Affleck / Damon Boston cluster + others ---
  m("argo", "Argo", 2012, ["Ben Affleck", "Bryan Cranston", "Alan Arkin", "John Goodman", "Victor Garber"], 5),
  m("the-town", "The Town", 2010, ["Ben Affleck", "Jeremy Renner", "Rebecca Hall", "Jon Hamm", "Blake Lively"], 200),
  m("manchester-by-the-sea", "Manchester by the Sea", 2016, ["Casey Affleck", "Michelle Williams", "Lucas Hedges", "Kyle Chandler"], 210),
  m("the-martian", "The Martian", 2015, ["Matt Damon", "Jessica Chastain", "Kristen Wiig", "Jeff Daniels", "Michael Peña", "Kate Mara", "Sean Bean", "Chiwetel Ejiofor"], 15),
  m("ford-v-ferrari", "Ford v Ferrari", 2019, ["Matt Damon", "Christian Bale", "Jon Bernthal", "Caitriona Balfe", "Tracy Letts"], 0),
  m("air", "Air", 2023, ["Matt Damon", "Ben Affleck", "Jason Bateman", "Viola Davis", "Chris Tucker"], 20),

  // --- Christopher Plummer / classic cluster ---
  m("all-the-money", "All the Money in the World", 2017, ["Michelle Williams", "Christopher Plummer", "Mark Wahlberg"], 35),

  // --- Misc heavy hitters ---
  m("children-of-men", "Children of Men", 2006, ["Clive Owen", "Julianne Moore", "Michael Caine", "Chiwetel Ejiofor", "Charlie Hunnam"], 110),
  m("gravity", "Gravity", 2013, ["Sandra Bullock", "George Clooney"], 200),
  m("the-grey", "The Grey", 2011, ["Liam Neeson", "Frank Grillo", "Dermot Mulroney", "Dallas Roberts"], 220),
  m("taken", "Taken", 2008, ["Liam Neeson", "Maggie Grace", "Famke Janssen"], 0),
  m("the-fighter", "The Fighter", 2010, ["Christian Bale", "Mark Wahlberg", "Amy Adams", "Melissa Leo"], 30),
  m("american-hustle", "American Hustle", 2013, ["Christian Bale", "Amy Adams", "Bradley Cooper", "Jeremy Renner", "Jennifer Lawrence", "Louis C.K.", "Robert De Niro"], 30),
  m("silver-linings", "Silver Linings Playbook", 2012, ["Bradley Cooper", "Jennifer Lawrence", "Robert De Niro", "Jacki Weaver", "Chris Tucker"], 0),
  m("hunger-games", "The Hunger Games", 2012, ["Jennifer Lawrence", "Josh Hutcherson", "Liam Hemsworth", "Woody Harrelson", "Elizabeth Banks", "Stanley Tucci", "Lenny Kravitz", "Donald Sutherland"], 110),
  m("xmen-first-class", "X-Men: First Class", 2011, ["James McAvoy", "Michael Fassbender", "Jennifer Lawrence", "Kevin Bacon", "Rose Byrne", "January Jones"], 230),
  m("xmen-days", "X-Men: Days of Future Past", 2014, ["Hugh Jackman", "James McAvoy", "Michael Fassbender", "Jennifer Lawrence", "Patrick Stewart", "Ian McKellen", "Peter Dinklage", "Halle Berry"], 220),
  m("logan", "Logan", 2017, ["Hugh Jackman", "Patrick Stewart", "Dafne Keen", "Boyd Holbrook", "Stephen Merchant"], 0),

  // --- Streep / classics ---
  m("devil-wears-prada", "The Devil Wears Prada", 2006, ["Meryl Streep", "Anne Hathaway", "Emily Blunt", "Stanley Tucci", "Adrian Grenier"], 320),
  m("doubt", "Doubt", 2008, ["Meryl Streep", "Philip Seymour Hoffman", "Amy Adams", "Viola Davis"], 0),
  m("julie-julia", "Julie & Julia", 2009, ["Meryl Streep", "Amy Adams", "Stanley Tucci", "Chris Messina"], 30),

  // --- Marriage Story / Driver cluster ---
  m("marriage-story", "Marriage Story", 2019, ["Adam Driver", "Scarlett Johansson", "Laura Dern", "Alan Alda", "Ray Liotta"], 0),
  m("the-report", "The Report", 2019, ["Adam Driver", "Annette Bening", "Jon Hamm", "Maura Tierney"], 215),

  // --- More classics ---
  m("scarface", "Scarface", 1983, ["Al Pacino", "Steven Bauer", "Michelle Pfeiffer", "Mary Elizabeth Mastrantonio", "Robert Loggia"], 20),
  m("godfather", "The Godfather", 1972, ["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall", "Diane Keaton"], 30),
  m("godfather-2", "The Godfather Part II", 1974, ["Al Pacino", "Robert De Niro", "Robert Duvall", "Diane Keaton", "Talia Shire"], 35),
  m("apocalypse-now", "Apocalypse Now", 1979, ["Marlon Brando", "Martin Sheen", "Robert Duvall", "Laurence Fishburne", "Harrison Ford"], 25),
  m("blade-runner", "Blade Runner", 1982, ["Harrison Ford", "Rutger Hauer", "Sean Young", "Edward James Olmos"], 210),
  m("the-shining", "The Shining", 1980, ["Jack Nicholson", "Shelley Duvall", "Danny Lloyd", "Scatman Crothers"], 0),
  m("aliens", "Aliens", 1986, ["Sigourney Weaver", "Michael Biehn", "Carrie Henn", "Paul Reiser", "Bill Paxton", "Lance Henriksen"], 200),
  m("die-hard", "Die Hard", 1988, ["Bruce Willis", "Alan Rickman", "Bonnie Bedelia", "Reginald VelJohnson"], 20),

  // --- Pixar/Disney live-action ---
  m("pirates-curse-of-pearl", "Pirates of the Caribbean: The Curse of the Black Pearl", 2003, ["Johnny Depp", "Orlando Bloom", "Keira Knightley", "Geoffrey Rush", "Jack Davenport"], 200),
];

export const ACTORS_NAMES: Record<string, string> = {};
for (const movie of MOVIES) {
  // Build from cast IDs back to display names using the source maps below.
}

// Helper: map kebab id -> display name. We do this by reverse-engineering from the
// original spelling-preserved names. Easier approach: redo the toId on a name list.
const ALL_NAMES = [
  ...new Set(
    MOVIES.flatMap((mv) => mv.cast),
  ),
];

// We need the display names. Maintain a sorted master list of unique actor display
// names below. (Built once, kept in sync with the MOVIES table above.)
const DISPLAY_NAMES: string[] = [
  "Aaron Eckhart","Adam Driver","Adam Sandler","Adrian Grenier","Adrien Brody","Al Pacino","Alan Alda","Alan Arkin","Alan Kim","Alan Rickman","Alana Haim","Albert Brooks","Alden Ehrenreich","Alec Baldwin","Alessandro Nivola","Alex Wolff","Alfie Allen","Alfred Molina","Alicia Vikander","Allison Williams","Amy Adams","Amy Poehler","Amy Ryan","Ana de Armas","Andrea Riseborough","André Holland","Andrew Garfield","Andy García","Andy Serkis","Angelina Jolie","Anjelica Huston","Ann Dowd","Anna Paquin","Annette Bening","Anne Hathaway","Anthony Edwards","Anthony Gonzalez","Anthony Hopkins","Anthony Mackie","Antony Starr","Anya Taylor-Joy","Ariana DeBose","Armie Hammer","Ansel Elgort","Asa Butterfield","Ashley Judd","Austin Butler","Barbara Hershey","Barry Keoghan","Ben Affleck","Ben Burtt","Ben Kingsley","Ben Mendelsohn","Ben Whishaw","Benedict Cumberbatch","Benedict Wong","Benicio del Toro","Benjamin Bratt","Bernard Hill","Bernie Mac","Billy Crudup","Billy Zane","Bill Hader","Bill Murray","Bill Paxton","Blake Lively","Bo Svenson","Bob Odenkirk","Bob Peterson","Bobby Cannavale","Bonnie Bedelia","Boyd Holbrook","Brad Garrett","Brad Pitt","Bradley Cooper","Bradley Whitford","Brandon Perea","Brendan Fraser","Brendan Gleeson","Brett Cullen","Brian Cox","Brie Larson","Bruce Dern","Bruce Willis","Bryan Cranston","Burt Reynolds","Caitriona Balfe","Cameron Diaz","Carey Mulligan","Carrie Fisher","Carrie Henn","Carrie-Anne Moss","Casey Affleck","Catherine Keener","Catherine Zeta-Jones","Cathy Moriarty","Cate Blanchett","Celia Rowlson-Hall","Chadwick Boseman","Channing Tatum","Charlie Hunnam","Charlize Theron","Chiwetel Ejiofor","Chloë Grace Moretz","Cho Yeo-jeong","Choi Woo-shik","Chris Cooper","Chris Evans","Chris Hemsworth","Chris Messina","Chris O'Dowd","Chris Pratt","Chris Tucker","Christian Bale","Christian Friedel","Christina Applegate","Christoph Waltz","Christopher Abbott","Christopher Lee","Christopher Mintz-Plasse","Christopher Plummer","Christopher Walken","Ciarán Hinds","Claire Foy","Clive Owen","Colin Farrell","Cooper Hoffman","Craig T. Nelson","Cybill Shepherd","Dafne Keen","Daisy Ridley","Dakota Fanning","Dallas Roberts","Dan Fogler","Danai Gurira","Daniel Craig","Daniel Day-Lewis","Daniel Kaluuya","Daniel Radcliffe","Danny Glover","Danny Lloyd","Dave Bautista","Dave Franco","Daveed Diggs","David Bowie","David Carradine","David Koechner","David Strathairn","David Thewlis","Dermot Mulroney","Dev Patel","Diane Keaton","Diane Kruger","Diane Lane","Diego Luna","Domhnall Gleeson","Don Cheadle","Don Johnson","Don Rickles","Donald Glover","Donald Sutherland","Donnie Yen","Drew Barrymore","Ed Asner","Ed Harris","Eddie Redmayne","Edward Burns","Edward James Olmos","Edward Norton","Eli Roth","Elijah Wood","Elisabeth Moss","Elissa Knight","Eliza Doolittle","Elizabeth Banks","Elizabeth Debicki","Ellar Coltrane","Ellen Barkin","Ellen Burstyn","Ellen DeGeneres","Ellen Page","Elliott Gould","Emilia Clarke","Emily Blunt","Emily Mortimer","Emma Stone","Emma Watson","Emmanuelle Béart","Eric Bana","Eric Bogosian","Erika Alexander","Esther Garrel","Ethan Hawke","Eva Green","Evan Rachel Wood","Evangeline Lilly","Ezra Miller","Famke Janssen","Felicity Jones","Fionn Whitehead","Florence Pugh","Forest Whitaker","Frances Conroy","Frances Fisher","Frances McDormand","Frank Grillo","Frankie Corio","Fred Melamed","Fred Willard","Gabriel Byrne","Gabriel LaBelle","Gael García Bernal","Gal Gadot","Gary Oldman","Gary Sinise","Gemma Chan","Gene Hackman","Geoffrey Arend","Geoffrey Rush","George Clooney","Gina Gershon","Glen Powell","Greta Lee","Guy Pearce","Gwyneth Paltrow","Hailee Steinfeld","Halle Berry","Han Ye-ri","Harris Dickinson","Harrison Ford","Harry Styles","Harvey Keitel","Hayley Atwell","Heath Ledger","Helena Bonham Carter","Henry Cavill","Henry Czerny","Henry Thomas","Holly Hunter","Holt McCallany","Hong Chau","Hugh Jackman","Hugh Keays-Byrne","Hugo Weaving","Ian McKellen","Ian McShane","Ice Cube","Idina Menzel","Idris Elba","Isabella Rossellini","Issa Rae","Izabella Scorupco","J.K. Simmons","Jack Black","Jack Nicholson","Jack Reynor","Jacob Batalon","Jacob Tremblay","Jacki Weaver","Jamie Foxx","Jamie Lee Curtis","Janeane Garofalo","Janelle Monáe","Jared Leto","Jason Bateman","Jason Lee","Jason London","Jason Momoa","Jason Robards","Jason Schwartzman","Javier Bardem","Jay Baruchel","Jeff Bridges","Jeff Daniels","Jeff Garlin","Jeff Goldblum","Jeffrey Wright","Jennifer Connelly","Jennifer Jason Leigh","Jennifer Lawrence","Jeremy Allen White","Jeremy Irons","Jeremy Renner","Jesse Eisenberg","Jesse Plemons","Jessica Chastain","Jessie Buckley","Jim Broadbent","Jim Carrey","Jodie Foster","Joe Pantoliano","Joe Pesci","John C. Reilly","John Boyega","John David Washington","John Doman","John Goodman","John Hamm","John Krasinski","John Legend","John Lithgow","John Magaro","John Malkovich","John Noble","John Ortiz","John Ratzenberger","John Travolta","John Turturro","Johnny Depp","Jon Bernthal","Jon Hamm","Jon Voight","Jonah Hill","Jordan Nagai","Jordana Brewster","Joel Edgerton","Joaquin Phoenix","Joan Allen","Joan Cusack","Josh Brolin","Josh Hutcherson","Josh O'Connor","Joseph Gordon-Levitt","Judi Dench","Jude Law","Julia Fox","Julia Roberts","Julianne Moore","Julie Delpy","Justin Timberlake","Kate Beckinsale","Kate Dickie","Kate Hudson","Kate Mara","Kate McKinnon","Kate Winslet","Katherine Heigl","Katherine Waterston","Kathryn Hahn","Kathy Bates","Karen Allen","Karen Gillan","Karl Urban","Karren Karagulian","Ke Huy Quan","Keanu Reeves","Keira Knightley","Keke Palmer","Ken Watanabe","Kenneth Branagh","Kerry Condon","Kerry Washington","Kevin Bacon","Kevin Costner","Kevin Spacey","Kirsten Dunst","Kit Harington","Kristen Wiig","Kumail Nanjiani","Kurt Russell","Kyle Chandler","LaKeith Stanfield","Lakeith Stanfield","Lance Henriksen","Lashana Lynch","Laura Dern","Laura Linney","Laurence Fishburne","Laurie Metcalf","Lee Pace","Lee Sun-kyun","Lenny Kravitz","Leonardo DiCaprio","Lesley Manville","Leslie Mann","Leslie Odom Jr.","Letitia Wright","Lewis Black","Liam Hemsworth","Liam Neeson","Lily Gladstone","Lily James","Liv Tyler","Logan Lerman","Lorelei Linklater","Lorraine Bracco","Lou Romano","Louis C.K.","Lucas Hedges","Lucy Liu","Ludacris","Luke Evans","Luke Wilson","Lupita Nyong'o","Léa Seydoux","Mads Mikkelsen","Maggie Grace","Maggie Gyllenhaal","Maggie Smith","Mahershala Ali","Mackenzie Foy","Marisa Tomei","Mark Dacascos","Mark Eydelshteyn","Mark Hamill","Mark Rylance","Mark Ruffalo","Mark Strong","Mark Wahlberg","Marlon Brando","Marlon Wayans","Margaret Qualley","Margot Robbie","Marion Cotillard","Martin Freeman","Martin Sheen","Mary Elizabeth Mastrantonio","Mary Steenburgen","Matthew McConaughey","Matt Damon","Mathieu Kassovitz","Maura Tierney","Maya Rudolph","Meat Loaf","Melissa McCarthy","Melissa Leo","Mena Suvari","Meryl Streep","Michael B. Jordan","Michael Biehn","Michael Caine","Michael Cera","Michael Fassbender","Michael Gambon","Michael Keaton","Michael Madsen","Michael Nyqvist","Michael Peña","Michael Shannon","Michael Stuhlbarg","Michelle Pfeiffer","Michelle Williams","Michelle Yeoh","Mickey Rourke","Mikey Madison","Mike Faist","Mike White","Mila Kunis","Miles Teller","Milla Jovovich","Millicent Simmonds","Milly Shapiro","Milo Machado-Graner","Mindy Kaling","Minnie Driver","Monica Bellucci","Morgan Freeman","Mykelti Williamson","Naomi Watts","Naomie Harris","Natalie Portman","Natascha McElhone","Ned Beatty","Neil Patrick Harris","Nicholas Hoult","Nicolas Cage","Nina Hoss","Noah Emmerich","Noah Jupe","Noémie Merlant","Olivia Colman","Olivia Williams","Olivia Wilde","Orlando Bloom","Oscar Isaac","Owen Wilson","Pam Grier","Park So-dam","Parker Posey","Patricia Arquette","Patrick Fugit","Patrick Stewart","Patton Oswalt","Paul Bettany","Paul Dano","Paul Freeman","Paul Giamatti","Paul Mescal","Paul Reiser","Paul Rudd","Paul Sorvino","Paul Walker","Peter Coyote","Peter Dinklage","Peter O'Toole","Peter Stormare","Philip Seymour Hoffman","Phylicia Rashad","Phyllis Smith","Pierce Brosnan","Questlove","Quentin Tarantino","Rachel McAdams","Rachel Weisz","Rachel Zegler","Ralph Armitage","Ralph Fiennes","Ralph Ineson","Rami Malek","Ramy Youssef","Ray Liotta","Ray Romano","Ray Winstone","Rebecca Ferguson","Rebecca Hall","Reginald VelJohnson","Richard Armitage","Richard Attenborough","Richard Dreyfuss","Richard Harris","Richard Jenkins","Richard Kind","Richard Madden","Rita Moreno","Rob Reiner","Robbie Coltrane","Robert De Niro","Robert Downey Jr.","Robert Duvall","Robert Forster","Robert Loggia","Robert Pattinson","Robert Redford","Robert Shaw","Robin Williams","Robin Wright","Romany Malco","Rooney Mara","Rose Byrne","Rosemarie DeWitt","Rosamund Pike","Rosie Huntington-Whiteley","Roy Scheider","Rupert Grint","Russell Crowe","Rutger Hauer","Ryan Gosling","Sacha Baron Cohen","Sadie Sink","Sally Field","Salma Hayek","Sam Elliott","Sam Neill","Sam Rockwell","Samuel L. Jackson","Sandra Bullock","Sandra Hüller","Sarah Paulson","Sarah Vowell","Sarita Choudhury","Saoirse Ronan","Scarlett Johansson","Scatman Crothers","Scott Glenn","Sean Astin","Sean Bean","Sean Connery","Sean Harris","Sean Penn","Sean Young","Sebastian Stan","Seth Rogen","Sharon Stone","Shelley Duvall","Sigourney Weaver","Simon Pegg","Song Kang-ho","Stanley Tucci","Stellan Skarsgård","Stephanie Hsu","Stephen Merchant","Sterling K. Brown","Steve Buscemi","Steve Carell","Steven Bauer","Steven Yeun","Swann Arlaud","Talia Shire","Taraji P. Henson","Ted Levine","Teo Yoo","Terrence Howard","Thandiwe Newton","Thora Birch","Tilda Swinton","Tim Allen","Tim Blake Nelson","Tim Heidecker","Tim Roth","Timothée Chalamet","Timothy Spall","Tina Fey","Toby Maguire","Tobey Maguire","Tom Cruise","Tom Hanks","Tom Hardy","Tom Hiddleston","Tom Holland","Tom Sizemore","Tom Waits","Tom Wilkinson","Tommy Lee Jones","Toni Collette","Tony Revolori","Tracee Ellis Ross","Tracy Letts","Trevante Rhodes","Ty Simpkins","Tyler Perry","Tyrese Gibson","Uma Thurman","Val Kilmer","Vanessa Kirby","Vera Farmiga","Vicky Krieps","Viggo Mortensen","Vin Diesel","Vincent Cassel","Ving Rhames","Viola Davis","Vivica A. Fox","Wallace Shawn","Walton Goggins","Wes Bentley","Will Ferrell","Will Patton","Will Poulter","William H. Macy","William Jackson Harper","Willem Dafoe","Winona Ryder","Winston Duke","Woody Harrelson","Yura Borisov","Youn Yuh-jung","Zac Efron","Zach Galifianakis","Zazie Beetz","Zendaya","Zoe Saldaña","Zoë Kravitz","Zooey Deschanel"
];

for (const name of DISPLAY_NAMES) {
  ACTORS_NAMES[toId(name)] = name;
}

// Sanity: any cast id missing from ACTORS_NAMES gets a humanized fallback.
for (const id of ALL_NAMES) {
  if (!ACTORS_NAMES[id]) {
    ACTORS_NAMES[id] = id
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }
}

export const MOVIES_BY_ID: Record<string, Movie> = Object.fromEntries(
  MOVIES.map((m) => [m.id, m]),
);

export const FILMOGRAPHY: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const movie of MOVIES) {
    for (const actorId of movie.cast) {
      (out[actorId] ||= []).push(movie.id);
    }
  }
  return out;
})();

export const ACTORS = Object.entries(ACTORS_NAMES).map(([id, name]) => ({
  id,
  name,
  films: FILMOGRAPHY[id] || [],
}));
