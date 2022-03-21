// #####################################
// ** LOGSEQ PUBLSHED HTML custom.js modifiers
// Javascript content assumed to be called from index.html, ie remplacing "<head>" with "<head><script src="static/js/custom.js">"


// #####################################
// Reusable functions 
// #######

// Hide code for CodeBlock
zHideMermaidGraph = function () {
		// Hide mermaid graphs
		[... document.querySelectorAll("div.block-children-container * textarea[data-lang^='mermaid ']")]
			.forEach(e => { 
				e.closest('div.ls-block').setAttribute('style','display:none') 
			})
}

// Hide pages' properties
zHidePageProp = function () {
	[
		 ...[... document.querySelectorAll("span.opacity-50")].filter(z =>  (z.innerText=="Properties") )
		,...[ ... document.querySelectorAll("div.page-properties") ]
	].forEach(e => { 
				e.closest('div.ls-block').setAttribute('style','display:none') 
			})
}

// Avoid clicking on title for rename
zBlockTitleEditing = function() {
		document.querySelectorAll("a.page-title").forEach(e =>  e.setAttribute('onclick','event.stopPropagation(); return false;'))		
}


// Show/hide block properties on demand
window.ztoggle_blockprop = function()  {
	document.body.style.setProperty('--hide-blockprop',
		(window.getComputedStyle(document.body).getPropertyValue('--hide-blockprop').length==0?'none':'initial')
		)
}






// #####################################
// Event on first load
// #######

document.addEventListener("DOMContentLoaded", function(event) {
	
	console.log('ZZ DOMContentLoaded');
	


	// expend page width 
	document.querySelector(".cp__sidebar-main-content").setAttribute('style','max-width: var(--ls-main-content-max-width-wide);')

	// Add image background under main-container 
	var bgpic = document.createElement("img");
	bgpic.id = "bgpic";
	document.querySelector("#main-container").appendChild(bgpic)



	//******************//
	/* Top bar menu mgt: build dropdown menus based on favorites */


		// Close any open menu upon a click anywhere
		zToggleCloseAllMenu = function()  {
			document.querySelectorAll("div.dropdown-wrapper:not([style='display:none'])")
					.forEach( x=> x.setAttribute('style','display:none'));
		}
		document.body.addEventListener('click', zToggleCloseAllMenu , true); 

			
		// Display toggle for menu on title click 
		zToggleMenu = function(which) {
			
			which.parentElement.querySelector('div.dropdown-wrapper').setAttribute('style',
				(which.parentElement.querySelector('div.dropdown-wrapper').getAttribute('style').length==0?'display:none':'')
			)
			
		}


		// Build menus from favorites
		var zMenuTemplate = `<div class="relative ui__dropdown-trigger" style="z-index: 999;">
			<a onclick="zToggleMenu(this)" class="text-sm font-medium button">$parent_title$</a>
			
			<div style='display:none' class="dropdown-wrapper origin-top-right absolute right-0 mt-2 rounded-md shadow-lg transition ease-out duration-100 transform opacity-100 scale-100 enter-done">
				<div class="py-1 rounded-md shadow-xs">
					$subtitles$
				</div>
			</div>
		</div>
		`

		var zMenuSubTitles = `<a href="#/page/$link$"  class="block px-4 py-2 text-sm transition ease-in-out duration-150 cursor menu-link"><div class="flex items-center"><i class="ti ti-file-upload"></i><div style="margin-right: 8px;">$subtitle$</div></div></a>`


		var zNewMenus_HTML = {};
		[... document.querySelectorAll("ul.favorites > li > a")].map(z => { return(z.outerText.replace('◦','')); }).sort().forEach(z => {
			
				if (z.indexOf('/')==-1) {
					zNewMenus_HTML[z] = '';
					console.log('New entry', z);
				} else {
					try {
						zNewMenus_HTML[z.split('/')[0]] += zMenuSubTitles
													.replace('$link$',encodeURI(z.toLocaleLowerCase()).replace(/\//gmi,'%2F'))
													.replace('$subtitle$',z.replace(z.split('/')[0]+'/',''))
					} catch (e) {}
				}
		})




		document.querySelector("#head > .r > .ui__dropdown-trigger").outerHTML = Object.keys(zNewMenus_HTML)
					.map(function(z) { 
						if (zNewMenus_HTML[z].length==0) { return; }
						return 	zMenuTemplate.replace('$parent_title$',((z==z.toUpperCase())?z.charAt(0).toUpperCase() + z.slice(1).toLowerCase():z)) //If all upper, make it only first letter up
								.replace('$subtitles$',zNewMenus_HTML[z]) 
									}).join("")
					+
					`<div class="" style="display: inline;"><a href="mailto:hello@hello.com" class="button"><i class="ti ti-mail" style="font-size: 20px;"></i></a></div>`

	// *******************
	// On page initial load: launch common DOM modifiers 
	 
	zBlockTitleEditing();
	zHideMermaidGraph();
	zHidePageProp();
});




// #####################################
// Events on page switch
// #######
	
window.addEventListener("DOMNodeInserted", function (e) {
                
				console.log('ZZ',e,e.path);
				
				// ON CLICK REACTION:  Avoid clicking on title for rename
				try {
					if (e.path[0].getAttribute('class')=='flex-1 page relative ') {
						zBlockTitleEditing();
					}
				} catch(e) {}


				
				
				// ON CLICK REACTION: Look for creation of custom-context-menu
				try {
					if (e.path[0].getAttribute('id')=='custom-context-menu') {
											
						// 10+ menu entries is a block menu, else a page menu 
						var zMenuLinks = [document.querySelectorAll("#custom-context-menu > div > div, #custom-context-menu > div > a") ];
						if (zMenuLinks[0].length > 10) {
							i=0; zMenuLinks[0].forEach(z => { i++; if (!(i==3||i==7||i==10||i==11)) { z.className += " hidden" }})
						} else {
							i=0; zMenuLinks[0].forEach(z => { i++; if (i==1||i==2||i==3) { z.className += " hidden" }})
						}
						
					}
				} catch(e) {}
				
				// PAGE CHANGE with Delayed Update: Look for creation of new Code block, and hide it code if it is a Mermaid graph
				try {
					if (e.path[0].getAttribute('class')=='CodeMirror') {
						zHideMermaidGraph();
					}
				} catch(e) {}
				
				
				
				// PAGE CHANGE: Look for a page title that would show page's properties
				try {
					if (e.srcElement.getAttribute('class').indexOf('flex-1 page relative')>=0) {
						zHidePageProp();
					}
				} catch(e) {}
				
            });
			
			
			
