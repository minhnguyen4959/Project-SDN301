import React from "react";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Col, Form, Row, Table } from "react-bootstrap";
import Paginate from "../components/Paginate";
import InputGroup from "react-bootstrap/InputGroup";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import { AiFillCaretRight } from "react-icons/ai";
import axios from "axios";
import { DatePicker } from 'antd';

export default function OrdersManager() {
  const [orders, setOrders] = useState([]); //fetched orders
  const [status, setStatus] = useState([]); //fetched status
  const [lgShow, setLgShow] = useState(false); //modal
  // const effectBadge = ["warning", "warning", "primary", "success", "danger"]; // each status has it badge
  // const colorBadge = ["#9ea954db", "#9ea954db", "#3876a9", "#248e5cd6", "#7c3c3cd6"];  // each status has it color
  const effectBadge = {
    preparing: "warning",
    pending: "primary",
    shipping: "primary",
    preparing: "warning",
    successful: "success",
    failed: "danger",
  }; // each status has it color
  const colorBadge = {
    preparing: "#9ea954db",
    pending: "#3876a9",
    shipping: "#3876a9",
    preparing: "#9ea954db",
    successful: "#248e5cd6",
    failed: "#7c3c3cd6",
  }; // each status has it color
  const [currentDetail, setCurrentDetail] = useState([]);
  const user = JSON.parse(localStorage.getItem("data"));

  //for filtering
  const [statusFilter, setStatusFilter] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [email, setEmail] = useState("");

  const [refresh, setRefresh] = useState(true);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { RangePicker } = DatePicker;

  const onOk = (value) => {
    console.log('onOk: ', value);
    setFromDate(value[0]);
    setToDate(value[1]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  //

  useEffect(() => {
    fetch(`https://wdp.bachgiaphat.vn/status`)
      .then((res) => res.json())
      .then((json) => {
        setStatus(json);
      });
  }, []);

  const openDetail = (index) => {
    // fetch(`https://wdp.bachgiaphat.vn/order/` + id)
    //   .then(res => res.json())
    //   .then(json => {
    //     setCurrentDetail(json)
    //   }
    //   );
    setCurrentDetail(orders[index]);
  };

  useEffect(() => {
    //filter with status, order id
    filterOrder(currentPage);
  }, [currentPage, orderIdFilter, statusFilter, fromDate, toDate, refresh, email]);

  const filterOrder = (page) => {
    let url = `https://wdp.bachgiaphat.vn/orders/all?page=${page}`;

    if (fromDate && toDate) {
      url += `&fromDate=${fromDate}&toDate=${toDate}`;
    }

    if (statusFilter !== "") {
      url += "&status=" + statusFilter;
    }

    if (email !== "") {
      url += "&email=" + email;
    }

    if (orderIdFilter !== "") {
      url += "&id=" + orderIdFilter;
    }

    axios
      .get(url)
      .then((res) => {
        console.log("data order:", res);
        setTotalPages(res.data.totalPages);
        setOrders(res.data.docs);
        return res.data.docs;
      })
      .catch((err) => toast.error(err));
  };

  const updateStatus = (value, index, id) => {
    console.log("status: ", value);
    console.log("status: ", typeof value);
    axios
      .put(`https://wdp.bachgiaphat.vn/orders/${id}`, {
        ...orders[index],
        status: value,
      })
      .then(() => {
        const updatedOrders = [...orders];
        updatedOrders[index].status._id = value;
        setOrders(updatedOrders);
        setRefresh(!refresh);
        toast.success("Order status updated successfully");
      })
      .catch((err) => toast.error(err));
  };

  return (
    <Container lg={10}>
      <h3 className="mt-2">My orders</h3>
      <Row className="my-4">
        <Col xs={6} md={2}>
          <InputGroup className="mb-3">
            <InputGroup.Text>Status</InputGroup.Text>
            <Form.Select
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value={""}>all</option>
              {status?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
        <Col xs={6} md={4}>
          <InputGroup className="mb-3">
            <InputGroup.Text>Email</InputGroup.Text>
            <Form.Control
              onChange={(e) => {
                setEmail(e.target.value);
                // setCurrentPage(1);
              }}
            ></Form.Control>
          </InputGroup>
        </Col>
        <Col xs={12} md={6} className="text-right">
          <RangePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            size='large'
            onChange={(value, dateString) => {
              console.log('Selected Time: ', value);
              console.log('Formatted Selected Time: ', dateString);
              onOk(dateString);
            }}
          />
        </Col>
      </Row>
      {orders.map((o, index) => (
        <div key={index} className="m-2 mb-4">
          <Card
            className="m-2"
            style={{ background: colorBadge[o.status.name] }}
          >
            <Card.Header className="row">
              <div className="col-3">
                <div style={{ color: "black" }}>ID: {o._id}</div>
              </div>
              <div className="col-1">
                <Badge bg={effectBadge[o.status.name]}>{o.status.name}</Badge>
              </div>
              <div className="col-3">
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: "#008DDA" }}>
                    Change status
                  </InputGroup.Text>
                  <Form.Select
                    value={o.status._id}
                    onChange={(e) => updateStatus(e.target.value, index, o._id)}
                  >
                    {status?.map((s) => (
                      <option key={s.id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>{" "}
                </InputGroup>
              </div>
              <div className="col-3">
                <p style={{ color: "black" }}>
                  Create date: {new Date(o.date).toLocaleString()}
                </p>
              </div>
            </Card.Header>
            <Card.Body className="row m-1" style={{ background: "white" }}>
              <Card.Title className="col-4">
                {o.name} <br></br>
                {o.user?.email} <br></br>
                {o.phone}
              </Card.Title>
              <Card.Text className="col-4">
                {"Zipcode: " +
                  o.address?.zipcode +
                  ". Address: " +
                  o.address?.detailAddress +
                  ", " +
                  o.address?.city +
                  ", " +
                  o.address?.state +
                  ", " +
                  o.address?.country}
              </Card.Text>
              <Card.Text className="col-2">
                {o.productList?.length} x products
              </Card.Text>
              <Card.Text className="col-2">$ {o.totalAmount}</Card.Text>
              <Button
                onClick={() => {
                  setLgShow(true);
                  openDetail(index);
                }}
                className="btn-light btn-outline-dark"
              >
                Detail
              </Button>
            </Card.Body>
          </Card>
        </div>
      ))}
      <Row>
        <Col xs={12} md={12}>
          <div className="pagination mb-3 justify-content-end">
            <Paginate
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              handlePrevPage={handlePrevPage}
              handleNextPage={handleNextPage}
            />
          </div>
        </Col>
      </Row>
      <Modal
        size="lg"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Order id: {currentDetail._id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="m-2">
            <Card.Header
              style={{ background: colorBadge[currentDetail.status?.name] }}
            >
              <div style={{ color: "black" }}>Status</div>{" "}
              <Badge bg={effectBadge[currentDetail.status?.name]}>
                {status[currentDetail.status]?.name}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Card.Title>
                {currentDetail.name} <br></br>
                {currentDetail.phone}
              </Card.Title>
              <Card.Text>
                {"Zipcode: " +
                  currentDetail.address?.zipcode +
                  ". Address: " +
                  currentDetail.address?.detailAddress +
                  ", " +
                  currentDetail.address?.city +
                  ", " +
                  currentDetail.address?.state +
                  ", " +
                  currentDetail.address?.country}
              </Card.Text>
              <Card.Text>
                {currentDetail.productList?.length} x products
              </Card.Text>
              <Card.Text>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDetail?.productList?.map((p, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <button
                            onClick={() => {
                              window.location = `/product/${p.productId}`;
                            }}
                            type="button"
                            style={{ minWidth: "10ch" }}
                            className="btn btn-dark"
                          >
                            {p.productId} <AiFillCaretRight className="m-0" />
                          </button>
                        </td>
                        <td>{p.productName}</td>
                        <td>{p.quantity}</td>
                        <td>{Number(p.unitPrice) * p.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Text>
              <Card.Text>
                <p style={{ fontWeight: "bold" }}>Total:</p>
                <p style={{ fontWeight: "bold" }}>
                  $ {currentDetail.totalAmount}
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Modal.Body>
      </Modal>
    </Container>
  );
}