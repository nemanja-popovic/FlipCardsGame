
$(document).ready(function () {
   
    $('.click').click(function () {
        if ($(this).hasClass('flip'))
        {
            $(this).removeClass('flip');
        }
        else {
            $(this).addClass('flip')
        }
    });

    //SignalR code
    var gameHub = $.connection.gameHub;

    $.connection.hub.start().done(function () {
        $('#join').removeAttr('disabled');
    });

    //Form
    $('#join').attr('disabled', 'disabled');
    $('#join').click(function () {
        var un = $('#usernameTb').val();
        gameHub.server.join(un);
    });

    var userId;
    gameHub.client.playerJoined = function (user) {
        userId = user.Id;
        $('#usernameTb').attr('disabled', 'disabled');
        $('#join').attr('disabled', 'disabled');
    };

    Handlebars.registerHelper("endRow", function (conditional, options) {
        if ((conditional + 1) % 5 == 0 && conditional > 0) {
            return options.fn(this);
        }
        return "";
    });

    gameHub.client.buildBoard = function (game) {
        var template = Handlebars.compile($('#card-template').html());

        $('#board').html(template(game.Board));

        if (userId == game.WhosTurn) {
            $('#alert').html("You get to play first!");
            $('.container').addClass('playPointer');
        }
        else {
            $('#alert').html("Your opponent gets to play first!");
            $('.container').addClass('stopPointer');
        }

        $('div[id^=card-]').click(function (e) {
            e.preventDefault();

            var id = this.id;
            var card = $('#' + id);

            if (!card.hasClass('match') && !card.hasClass('flip')) {
                gameHub.server.flip(id).done(function (result) {
                    if (result) {
                        gameHub.server.checkCard(id);
                    }
                });
            }
        });
    };

    gameHub.client.flipCard = function (card) {
        console.log('FLIPPP');
        console.log(card);
        var c = $('#card-' + card.Id);
        $(c).addClass('flip');
    };

    gameHub.client.resetFlip = function (cardA,cardB) {
       
        console.log('resetFlip');

        if ($('.container').hasClass('stopPointer')) {
            $('.container').removeClass('stopPointer');
            $('.container').addClass('playPointer');
        }
        else {
            $('.container').removeClass('playPointer');
            $('.container').addClass('stopPointer');
        }

        var cA = $('#card-' + cardA.Id);
        var cB = $('#card-' + cardB.Id);

        var delay = setTimeout(function () {
            cA.removeClass('flip');
            cB.removeClass('flip');
        },1500);
       
    };


    gameHub.client.showMatch = function (card, winner) {

        $('#card-' + card.Id).addClass('match');
        $('#card-' + card.Pair).addClass('match');

        $('#alert').html(winner + " found a match!");
        if (winner == $('#usernameTb').val()) {
            $('#wins').append("<li><img src='"+card.Image+"' class='smallCard' /></li>");
        }

       
    };
    gameHub.client.winner = function (card, winner) {
        if (winner == $('#usernameTb').val()) 
            $('#modal-headline').html('You won!');
        else
            $('#modal-headline').html('You lost!');


        $('#winModal').modal({ show: true }).on('hide.bs.modal', function () {
            $('#board').html('');
            $('#usernameTb').removeAttr('disabled');
            $('#join').removeAttr('disabled');
            $('#wins').html('');
            $('#alert').html("Please enter your name and click join to begin playing a match");
        });

    };


    gameHub.client.waitingList = function () {
        $('#alert').html("No opponent at this moment, as soon as one joins your game will start!");
    };

});
