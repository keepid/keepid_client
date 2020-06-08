import React, { Component } from 'react';

interface Props {
    formQuestions: [string, string][],
}

interface State {
    formAnswers: any,
}

class ApplicationForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      formAnswers: {},
    };
    this.handleChangeFormValue = this.handleChangeFormValue.bind(this);
  }

  componentDidMount() {
    const {
      formQuestions,
    } = this.props;
    const {
      formAnswers,
    } = this.state;
    formQuestions.map((entry) => (formAnswers[entry[0]] = ''));
    this.setState({ formAnswers });
  }

  handleChangeFormValue(event: any) {
    const {
      formAnswers,
    } = this.state;
    const { id } = event.target;
    const { value } = event.target;
    formAnswers[id] = value;
    console.log(formAnswers);
    this.setState({ formAnswers });
  }

  onSubmit(event: any) {
    event.preventDefault();
    const {
      formAnswers,
    } = this.state;
  }

  render() {
    const {
      formQuestions,
    } = this.props;
    return (
      <div>
        <form>
          {formQuestions.map(
            (entry) => (
              <label htmlFor={entry[0]}>
                {entry[1]}
                <input
                  type="text"
                  id={entry[0]}
                  onChange={this.handleChangeFormValue}
                  required
                />
              </label>
            ),
          )}
        </form>
      </div>
    );
  }
}

export default ApplicationForm;
