KKB. (Kanya-kanyang bayad) is a lightweight web app written in typescript that users use to split the bill by digitizing the receipt and assigning "people at the table" to the receipt items which then results in an interactive page where each person has their items totaled. This will be a mobile-first approach when designing the UI as I'm estimating 99% of sessions will be on a phone.

This app doesn't need a database, everything will be client-side. Though not sure if we will need one because I intend to add a feature for receipt OCR. Allow users to scan the receipt through the camera and digitize the line items and prices.

What I'm envisioning for the flow
- Home page (a hero section describing the app and then a big button to start the flow, no other clickable elements aside from maybe a github icon and the number of stars on the top right)
- AFter the big button is pressed, start by showing a page where they can scan a receipt or build the receipt manually through a simple UI. There will be a button to proceed with the next page
- After the button is pressed, show a page where a user can now add "people at the table" these will be the people that the receipt will be split into. There will be a button to proceed with the next page
- This will be the most important page of the flow, where the digitized receipt is displayed and then the user has a nice interactive UI where they can press a line item, open up a modal to select the person who ordered the item, and allow multiple select in case they've shared it with others at the table. There will be a button to proceed with the last page of the flow
- The last page is the summary page. Which intuitively displays the people at the table and their totals (alongside how everything was computed). The user can then save this to their device which saves the entire thing as a high-resolution screenshot they can share with others. A last button will then be here which brings them back to the home page

As for the design style im looking at using a minimal modern UI with shadcn components so its all consistent. Have a light/dark mode toggle and introduce an accent color of blue for the UI

As for the people at the table assign them an icon with a unique color so its easy to interact with the UI. You can use the modern approach of giving them initial icons like AV if my name there was Alfonso Verdana or Al if my name is just one "Alfonso"
