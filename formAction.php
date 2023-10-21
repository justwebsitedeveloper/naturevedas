<?php
// header("Access-Control-Allow-Origin: *");

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


//Make sure that it is a POST request.
if (strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0) {
    throw new Exception('Request method must be POST!');
}

//Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if (strcasecmp($contentType, 'application/json') != 0) {
    throw new Exception('Content type must be: application/json');
}

//Receive the RAW post data.
$content = trim(file_get_contents("php://input"));

//Attempt to decode the incoming RAW post data from JSON.
$decoded = json_decode($content, true);

//If json_decode failed, the JSON is invalid.
if (!is_array($decoded)) {
    throw new Exception('Received content contained invalid JSON!');
}

function html_table($data = array())
{
    $rows = '';
    foreach ($data as $key => $value) {
        $rows .= "<tr><td>$key</td><td>$value</td></tr>\n";
    }
    return $rows;
}


$html = '<p>Dear Sales team,<br/> You have recieved the following querry from the website<p>' . '<p><b>Name: </b>' . $decoded['name'] . '</p><p><b>Email: </b>' . $decoded['email'] . '</p><p><b>Phone Number: </b>' . $decoded['phone'] . '</p>';
$table = '<table border="1"><tr><th>Item</th><th>Quantity</th></tr>' . html_table($decoded['items']) . '</table>';
$message = '<p>' . $decoded['message'] . '</p><p>Regards,<br/>Nature Vedas';
//Process the JSON.
$customer_content = '<p>Dear ' . $decoded['name'] . ',<br/>Thank you for getting in touch with Nature Vedas regarding the quote for the following items</p>' . $table . '<p>We will get in touch with you soon.<br/><br/>Regards,<br/>Nature Vedas</p>';



$email = new \SendGrid\Mail\Mail();
$email->setFrom("haniel@rvmatrix.in", "Nature Vedas");
$email->setSubject('Thank you - Nature Vedas');
$email->addTo($decoded['email'], $decoded['name']);
$email->addContent("text/html", $customer_content);

$sale_email = new \SendGrid\Mail\Mail();
$sale_email->setFrom("haniel@rvmatrix.in", "Nature Vedas");
$sale_email->setSubject('Request for Quote');
$sale_email->addTo('haniel@rvmatrix.in', 'Haniel');
$sale_email->addContent("text/html", $html . $table . $message);


$sendgrid = new \SendGrid($_ENV['SENDGRID_API_KEY']);

try {
    $response = $sendgrid->send($email);
    if ($response->statusCode() == 202) {
        $response = $sendgrid->send($sale_email);
        if ($response->statusCode() == 202) {
            $response_array['status'] = 'success';
            echo json_encode($response_array);
        }else {
            $response_array['status'] = 'not sent';
            echo json_encode($response_array);
        }
    }else {
        $response_array['status'] = 'not sent';
        echo json_encode($response_array);
    }

   
} catch (Exception $e) {
    http_response_code(500);
    $response_array['status'] = 'failed';
    echo 'Caught exception: ' . $e->getMessage() . "\n";
}
