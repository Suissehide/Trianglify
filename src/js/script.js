/**
 * @script 
 * Provides some feature.
 *
 */

let code = String.raw`
<script src='https://unpkg.com/trianglify@^4/dist/trianglify.bundle.js'></script>
<script>
    var pattern = trianglify({
        width: settingsWidth,
        height: settingsHeight,
        xColors: settingsXColors,
        yColors: 'match',
        variance: settingsVariance,
        cellSize: settingsCellsize,
        colorFunction: settingsColorFunction,
        fill: true,
        strokeWidth: 1
    });
    document.body.appendChild(pattern.toCanvas())
<script>`

var settings,
    patternPreview,
    colorFunction = '',
    xColors = [];

function updateCanvas() {

    let intensity = parseFloat($('#settings_intensity').val())
    colorFunction = trianglify.colorFunctions.interpolateLinear(intensity);
    if ($('.js-pattern li.select').attr('data-num') === 'sparkle')
        colorFunction = trianglify.colorFunctions.sparkle(intensity / 2);
    if ($('.js-pattern li.select').attr('data-num') === 'shadows')
        colorFunction = trianglify.colorFunctions.shadows(intensity / 2);

    let canvasWidth = parseInt($('#settings_width').val()); //window.innerWidth
    let canvasHeight = parseInt($('#settings_height').val()); //window.innerHeight

    xColors = [];
    $('.palette-selected > div').each(function () { xColors.push(hexc($(this).css('backgroundColor'))); });

    settings = {
        height: canvasHeight > 4320 ? 4320 : canvasHeight,
        width: canvasWidth > 7680 ? 7680 : canvasWidth,
        xColors: xColors,
        yColors: 'match',
        fill: true,
        variance: parseFloat($('#settings_variance').val()),
        cellSize: parseFloat($('#settings_cellsize').val()),
        strokeWidth: 1,
        colorFunction: colorFunction,
        seed: null
    }

    let pattern = trianglify(settings);
    let preview = document.getElementById('canvas-preview');
    patternPreview = pattern.toCanvas(preview);

    //fix anti aliasing
    let context = patternPreview.getContext("2d");
    context.save();
    context.drawImage(patternPreview, 0, 0);
    context.restore();

    updateCode();
}

// var pattern = trianglify({
// cellSize: 75,
// variance: 0.75,
// seed: null,
// xColors: ['#FFA372', '#ED6663', '#B52B65', '#621055', '#120310'],
// yColors: 'match',
// fill: true,
// palette: trianglify.colorbrewer,
// colorSpace: 'lab',
// colorFunction: trianglify.colorFunctions.interpolateLinear(0.5),
// strokeWidth: 0,
// points: null
// })

function hexc(colorval) {
    let parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete (parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    return '#' + parts.join('');
}

/*============ HEIGHT / WIDTH ============*/
$('#settings_height, #settings_width').keyup(function () {
    updateCanvas();
})

/*============ INPUT ============*/
$('input[type=range]').on('input', function () {
    $(this).trigger('change');
    updateCanvas();
});

$('#randomize').click(function () {
    let intensity = ((Math.random() * $('#settings_intensity').attr('max')) + $('#settings_intensity').attr('min'))
    $('#settings_intensity').val((parseFloat(intensity)).toFixed(2));

    let variance = ((Math.random() * $('#settings_variance').attr('max')) + $('#settings_variance').attr('min'))
    $('#settings_variance').val((parseFloat(variance)).toFixed(2));

    let cellsize = Math.floor((Math.random() * $('#settings_cellsize').attr('max')) + $('#settings_cellsize').attr('min'))
    $('#settings_cellsize').val(cellsize);

    updateCanvas();
})

/*============ CODE ============*/
function updateCode() {
    let intensity = parseFloat($('#settings_intensity').val())
    let settingsColorFunction = 'trianglify.colorFunctions.interpolateLinear(' + intensity + ')';
    if ($('.js-pattern li.select').attr('data-num') === 'sparkle')
        settingsColorFunction = 'trianglify.colorFunctions.sparkle(' + intensity / 2 + ')';
    if ($('.js-pattern li.select').attr('data-num') === 'shadows')
        settingsColorFunction = 'trianglify.colorFunctions.shadows(' + intensity / 2 + ')';

    let newCode = code;
    newCode = newCode.replace('settingsHeight', parseInt($('#settings_height').val()) > 4320 ? 4320 : parseInt($('#settings_height').val()));
    newCode = newCode.replace('settingsWidth', parseInt($('#settings_width').val()) > 7680 ? 7680 : parseInt($('#settings_width').val()));
    newCode = newCode.replace('settingsVariance', parseFloat($('#settings_variance').val()));
    newCode = newCode.replace('settingsCellsize', parseInt($('#settings_cellsize').val()));
    newCode = newCode.replace('settingsXColors', '[' + xColors.join("', '") + ']');
    newCode = newCode.replace('settingsColorFunction', settingsColorFunction);

    // newCode = newCode.trim();
    $('.setting__code code').text(newCode);

    Prism.highlightElement($('#code')[0]);
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
    $('.js-copy .tooltip').toggleClass('show');
    setTimeout(function () {
        $('.js-copy .tooltip').toggleClass('show');
    }, 1000);
}



/*============ EXPORT ============*/
$('.preview__export-btn').click(function (e) {
    e.preventDefault();
    saveCanvasToPng(patternPreview);
    // downloadPng(pattern.png());
    $('.preview__export-btn .tooltip').toggleClass('show');
    setTimeout(function () {
        $('.preview__export-btn .tooltip').toggleClass('show');
    }, 1000);
});

function downloadPng(base64string) {
    const pageImage = new Image();
    pageImage.src = base64string;
    pageImage.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = pageImage.naturalWidth;
        canvas.height = pageImage.naturalHeight;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pageImage, 0, 0);
        saveCanvasToPng(canvas);
    }
}

function saveCanvasToPng(canvas) {
    let fileName = "trianglify";
    const link = document.createElement('a');
    link.download = fileName + '.png';
    canvas.toBlob(function (blob) {
        link.href = URL.createObjectURL(blob);
        link.click();
    });
}

/*============ TAB ============*/
let scrollbarWidth = 14;
$('.indicator').each(function () {
    $(this).css({ width: ($(this).parent().width() - scrollbarWidth) / parseInt($(this).parent().attr('tab-num')) });
});

var waveBtn = (function () {
    var btn = $('.wave');
    for (var i = 0; i < btn.length; i++) {
        btn[i].onmousedown = function (e) {
            var newRound = document.createElement('div'), x, y;

            newRound.className = 'cercle';
            this.appendChild(newRound);

            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop - 60 + $('.sidebar').scrollTop();

            newRound.style.left = x + "px";
            newRound.style.top = y + "px";
            newRound.className += " anim";

            setTimeout(function () {
                newRound.remove();
            }, 1200);

            let indicator = $(this).parent().find('.indicator'),
                tabWidth = ($(this).parent().width() - scrollbarWidth) / parseInt($(this).parent().attr('tab-num'));
            indicator.css({ marginLeft: (($(this).index() * tabWidth) + ($(this).index() * (scrollbarWidth - 9))) + 'px' });
        };
    }
}());

/*============ COLOR ============*/
function hexToRgb(hex) {
    hex = hex.substring(1);
    var arrBuff = new ArrayBuffer(4);
    var vw = new DataView(arrBuff);
    vw.setUint32(0, parseInt(hex, 16), false);
    var arrByte = new Uint8Array(arrBuff);

    return arrByte[1] + ", " + arrByte[2] + ", " + arrByte[3];
}

createPalette = (colors) => {
    let palette = $('<div class="palette"></div>')
    $.each(colors, function (key, value) {
        palette.append($('<div class="palette-swatch" style="background: rgb(' + hexToRgb(value) + ')"></div>'))
    });
    $('.default .palette-list').append(palette);
}

//init default palettes
!function () {
    $.each(colorbrewer.schemeGroups, function (key, value) {
        $.each(colorbrewer.schemeGroups[key], function (key, value) {
            if (colorbrewer[value][9] !== undefined) {
                createPalette(colorbrewer[value][9]);
            }
        });
    });
}();
$('.default .palette-list > div:first').addClass('palette-selected');


$('.js-pattern li').click(function () {
    $('.js-pattern li').removeClass('select');
    $(this).toggleClass('select')
    updateCanvas();
})

$('.palette-tab').hide()
$('.palette-tab.default').show()
$('.js-palette li').click(function () {
    let selected = $(this).attr('data-num');
    $('.palette-tab').hide();
    $('.' + selected).show();
});

$('.setting__palette').on('click', '.palette', function () {
    $('.palette').removeClass('palette-selected');
    $(this).addClass('palette-selected');
    updateCanvas();
})

function randomize(min, max) {
    return Math.floor((Math.random() * max + min))
}

$('.js-random-color').click(function () {
    let length = $('.default .palette-list > div').length;
    let index = $('.default .palette-selected').index() + 1;
    let rand = index;
    while (rand === index) rand = randomize(1, length)
    $('.palette').removeClass('palette-selected');
    $('.default .palette:nth-child(' + rand + ')').addClass('palette-selected');
    updateCanvas();
});


/*============ MODAL ============*/
$('.js-add-color').click(function () {
    $('.container, header').toggleClass('blur');
    $('.modal').show();
    updatePreviewPicker();
});

function hideModal() {
    $('.container, header').toggleClass('blur');
    $('.modal').hide();
}

$('.modal-close').click(function () {
    hideModal();
});

$(window).click(function (event) {
    if (event.target === $('.modal')[0]) {
        hideModal();
    }
});


/* init */
$('.color-picker-wrapper').each(function () {
    $(this).css({ 'background-color': 'rgb(' + hexToRgb($(this).children().val()) + ')' });
});
$('.palette-picker-list').on('change', '.palette-picker-swatch', function () {
    $(this).parent().css({ 'background-color': 'rgb(' + hexToRgb($(this).val()) + ')' });
});


$('.js-plus').click(function () {
    $('.palette-picker-list .color-picker-wrapper').last().clone().appendTo('.palette-picker-list');
    if ($('.palette-picker-list .color-picker-wrapper').length > 2)
        $('.js-minus').show();
});

$('.js-minus').click(function () {
    let n = $('.palette-picker-list .color-picker-wrapper').length;
    if (n > 2)
        $('.palette-picker-list .color-picker-wrapper').last().remove()
    if (n === 3)
        $('.js-minus').hide();
});


$('.js-save-palette').click(function () {
    let palette = $('<div class="palette"></div>')
    $('.palette-picker-list .palette-picker-swatch').each(function (index, value) {
        palette.append($('<div class="palette-swatch" style="background: rgb(' + hexToRgb($(this).val()) + ')"></div>'))
    })
    $('.custom .palette-list').append(palette);
    hideModal();
    $('.palette').removeClass('palette-selected');
    $('.custom .palette-list .palette').last().addClass('palette-selected');
    updateCanvas();
});


updatePreviewPicker = () => {
    previewColors = [];
    $('.palette-picker-list .palette-picker-swatch').each(function () { previewColors.push($(this).val()); });
    settings['xColors'] = previewColors;

    let pattern = trianglify(settings);
    let preview = document.getElementById('canvas-preview-picker');
    pattern.toCanvas(preview);
}


$('.palette-picker').on('click change', '.js-minus, .js-plus, .palette-picker-swatch', function () {
    updatePreviewPicker();
});

/*============ UPDATE ============*/
updateCanvas();
updatePreviewPicker();