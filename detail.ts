module Details
{
    export class Detail
    {
        Name: String;
        DetailLink: string;
        Description: string;
    }

    export function showDetails(input: Detail, callback)
    {        
        $('#detail-name').val(input.Name.toString());
        if(input.Description) $('#detail-description').val(input.Description.toString());
        if(input.DetailLink) $('#detail-url').val(input.DetailLink.toString());

        $('#detailModal').modal();

        $('#detail-btn-ok').on('click', function()
        {
            let d:Detail =
            {
                Name : <string>$('#detail-name').val(),
                DetailLink : <string>$('#detail-url').val(),
                Description : <string>$('#detail-description').val()
            }
            $('#detailModal').modal('hide');

            callback(d);
        });

        $('#detail-btn-cancel').on('click', function()
        {
            $('#detailModal').modal('hide');
        });
    }
}